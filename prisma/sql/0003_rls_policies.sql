-- Phase 2: RLS for the Supabase Data API (anon / authenticated).
-- Prisma / postgres / service_role bypass RLS unless FORCE is set — we do not FORCE.
-- Seller PII is never granted to anon. Marketplace reads go through listings_public.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.current_role()
RETURNS "UserRole"
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.role FROM public.users AS u WHERE u.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."developerCompanyId" FROM public.users AS u WHERE u.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.current_notary_office_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."notaryOfficeId" FROM public.users AS u WHERE u.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.can_access_listing(listing_row public.listings)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN private.current_role() = 'ADMIN' THEN true
    WHEN listing_row."sellerId" = auth.uid() THEN true
    WHEN private.current_role() = 'DEVELOPER_PROMOTER'
      AND listing_row."developerCompanyId" IS NOT NULL
      AND listing_row."developerCompanyId" = private.current_company_id()
      THEN true
    WHEN private.current_role() = 'NOTARY_PARTNER'
      AND listing_row."assignedNotaryOfficeId" IS NOT NULL
      AND listing_row."assignedNotaryOfficeId" = private.current_notary_office_id()
      THEN true
    WHEN listing_row."reservedByBuyerId" = auth.uid()
      AND listing_row.status IN ('RESERVED', 'NOTARY_REVIEW', 'COMPLETED')
      THEN true
    ELSE false
  END;
$$;

REVOKE ALL ON FUNCTION private.current_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_company_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_notary_office_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_access_listing(public.listings) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.current_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.current_notary_office_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_access_listing(public.listings) TO authenticated;

-- Public catalog: no seller/buyer identifiers. Owner rights (not invoker) so anon
-- can read LIVE/RESERVED rows without a GRANT on the base table.
CREATE OR REPLACE VIEW public.listings_public AS
SELECT
  l.id,
  l.status,
  l.title,
  l.city,
  l.district,
  l."propertyType",
  l."unitReference",
  l."totalContractPrice",
  l."amountPaid",
  l.currency,
  l."silentExit",
  l."developerCompanyId",
  l."reservationExpiresAt",
  l."createdAt",
  l."updatedAt"
FROM public.listings AS l
WHERE l.status IN ('LIVE', 'RESERVED');

REVOKE ALL ON public.listings_public FROM PUBLIC;
GRANT SELECT ON public.listings_public TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notary_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own_or_admin ON public.users;
CREATE POLICY users_select_own_or_admin
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR private.current_role() = 'ADMIN');

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = private.current_role());

DROP POLICY IF EXISTS users_update_admin ON public.users;
CREATE POLICY users_update_admin
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (private.current_role() = 'ADMIN')
  WITH CHECK (private.current_role() = 'ADMIN');

DROP POLICY IF EXISTS companies_select_authenticated ON public.developer_companies;
CREATE POLICY companies_select_authenticated
  ON public.developer_companies
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS companies_write_staff_or_admin ON public.developer_companies;
CREATE POLICY companies_write_staff_or_admin
  ON public.developer_companies
  FOR ALL
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR (private.current_role() = 'DEVELOPER_PROMOTER' AND id = private.current_company_id())
  )
  WITH CHECK (
    private.current_role() = 'ADMIN'
    OR (private.current_role() = 'DEVELOPER_PROMOTER' AND id = private.current_company_id())
  );

DROP POLICY IF EXISTS notaries_select_authenticated ON public.notary_offices;
CREATE POLICY notaries_select_authenticated
  ON public.notary_offices
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS notaries_write_staff_or_admin ON public.notary_offices;
CREATE POLICY notaries_write_staff_or_admin
  ON public.notary_offices
  FOR ALL
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR (private.current_role() = 'NOTARY_PARTNER' AND id = private.current_notary_office_id())
  )
  WITH CHECK (
    private.current_role() = 'ADMIN'
    OR (private.current_role() = 'NOTARY_PARTNER' AND id = private.current_notary_office_id())
  );

DROP POLICY IF EXISTS listings_select_authorized ON public.listings;
CREATE POLICY listings_select_authorized
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (private.can_access_listing(listings));

DROP POLICY IF EXISTS listings_insert_seller ON public.listings;
CREATE POLICY listings_insert_seller
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "sellerId" = auth.uid()
    AND private.current_role() IN ('SELLER', 'ADMIN')
  );

DROP POLICY IF EXISTS listings_update_authorized ON public.listings;
CREATE POLICY listings_update_authorized
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (private.can_access_listing(listings))
  WITH CHECK (private.can_access_listing(listings));

DROP POLICY IF EXISTS listings_delete_draft_or_admin ON public.listings;
CREATE POLICY listings_delete_draft_or_admin
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR ("sellerId" = auth.uid() AND status = 'DRAFT')
  );

DROP POLICY IF EXISTS approvals_select_authorized ON public.developer_approvals;
CREATE POLICY approvals_select_authorized
  ON public.developer_approvals
  FOR SELECT
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR "companyId" = private.current_company_id()
    OR EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId" AND private.can_access_listing(l)
    )
  );

DROP POLICY IF EXISTS approvals_write_promoter_or_admin ON public.developer_approvals;
CREATE POLICY approvals_write_promoter_or_admin
  ON public.developer_approvals
  FOR ALL
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR (
      private.current_role() = 'DEVELOPER_PROMOTER'
      AND "companyId" = private.current_company_id()
    )
  )
  WITH CHECK (
    private.current_role() = 'ADMIN'
    OR (
      private.current_role() = 'DEVELOPER_PROMOTER'
      AND "companyId" = private.current_company_id()
    )
  );

DROP POLICY IF EXISTS contracts_select_authorized ON public.contracts;
CREATE POLICY contracts_select_authorized
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId"
        AND private.can_access_listing(l)
        AND (
          private.current_role() IN ('ADMIN', 'SELLER', 'DEVELOPER_PROMOTER', 'NOTARY_PARTNER')
          OR (
            l."reservedByBuyerId" = auth.uid()
            AND l.status IN ('NOTARY_REVIEW', 'COMPLETED')
          )
        )
    )
  );

DROP POLICY IF EXISTS contracts_write_seller_or_admin ON public.contracts;
CREATE POLICY contracts_write_seller_or_admin
  ON public.contracts
  FOR ALL
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId" AND l."sellerId" = auth.uid()
    )
  )
  WITH CHECK (
    private.current_role() = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId" AND l."sellerId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS transactions_select_parties ON public.transactions;
CREATE POLICY transactions_select_parties
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    private.current_role() = 'ADMIN'
    OR "buyerId" = auth.uid()
    OR "sellerId" = auth.uid()
  );

DROP POLICY IF EXISTS transactions_write_admin ON public.transactions;
CREATE POLICY transactions_write_admin
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (private.current_role() = 'ADMIN')
  WITH CHECK (private.current_role() = 'ADMIN');

DROP POLICY IF EXISTS documents_select_authorized ON public.documents;
CREATE POLICY documents_select_authorized
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId"
        AND private.can_access_listing(l)
        AND (
          private.current_role() IN ('ADMIN', 'SELLER', 'DEVELOPER_PROMOTER', 'NOTARY_PARTNER')
          OR (
            l."reservedByBuyerId" = auth.uid()
            AND l.status IN ('NOTARY_REVIEW', 'COMPLETED')
          )
        )
    )
  );

DROP POLICY IF EXISTS documents_insert_uploader ON public.documents;
CREATE POLICY documents_insert_uploader
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "uploadedById" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.listings AS l
      WHERE l.id = "listingId" AND private.can_access_listing(l)
    )
  );

DROP POLICY IF EXISTS documents_update_uploader_or_admin ON public.documents;
CREATE POLICY documents_update_uploader_or_admin
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    "uploadedById" = auth.uid()
    OR private.current_role() = 'ADMIN'
  )
  WITH CHECK (
    "uploadedById" = auth.uid()
    OR private.current_role() = 'ADMIN'
  );

REVOKE ALL ON TABLE public.users FROM anon;
REVOKE ALL ON TABLE public.listings FROM anon;
REVOKE ALL ON TABLE public.documents FROM anon;
REVOKE ALL ON TABLE public.contracts FROM anon;
REVOKE ALL ON TABLE public.transactions FROM anon;
REVOKE ALL ON TABLE public.developer_approvals FROM anon;
REVOKE ALL ON TABLE public.developer_companies FROM anon;
REVOKE ALL ON TABLE public.notary_offices FROM anon;

GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.developer_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.developer_companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notary_offices TO authenticated;
