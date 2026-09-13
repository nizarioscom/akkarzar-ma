"use server";

import { fail, ok, type ApiResult } from "@/lib/api/response";
import { requireRole, isApiFailure } from "@/lib/auth/guards";
import { getListingForViewer, listPublicOpportunities } from "@/lib/listings/queries";
import type { PublicListing } from "@/lib/listings/silent-exit";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublicListingsAction(): Promise<ApiResult<PublicListing[]>> {
  const listings = await listPublicOpportunities();
  return ok(listings);
}

export async function getListingAction(listingId: string): Promise<ApiResult<PublicListing>> {
  if (!UUID_PATTERN.test(listingId)) {
    return fail("invalid_listing_id");
  }

  const listing = await getListingForViewer(listingId);
  if (!listing) {
    return fail("listing_not_found");
  }

  return ok(listing);
}

/** Example RBAC-guarded action for seller-owned draft work (no UI in Phase 2). */
export async function requireSellerSessionAction(): Promise<ApiResult<{ userId: string }>> {
  const profile = await requireRole(["SELLER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return profile;
  }
  return ok({ userId: profile.id });
}
