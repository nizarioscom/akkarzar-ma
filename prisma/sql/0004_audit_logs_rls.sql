ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_admin ON public.audit_logs;
CREATE POLICY audit_logs_select_admin
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (private.current_role() = 'ADMIN');

REVOKE ALL ON TABLE public.audit_logs FROM anon;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
