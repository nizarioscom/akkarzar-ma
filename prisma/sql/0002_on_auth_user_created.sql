-- Phase 2: create public.users when a Supabase Auth user is inserted.
-- Role is taken from raw_app_meta_data only (never user_metadata — that is user-editable).
-- SECURITY DEFINER lives in `private`, not in the exposed public schema.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role "UserRole" := 'BUYER';
BEGIN
  IF NEW.raw_app_meta_data ? 'role' THEN
    BEGIN
      assigned_role := (NEW.raw_app_meta_data ->> 'role')::"UserRole";
    EXCEPTION
      WHEN invalid_text_representation THEN
        assigned_role := 'BUYER';
    END;
  END IF;

  INSERT INTO public.users (id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();

-- Backfill profiles for Auth users created before the trigger existed.
INSERT INTO public.users (id, role)
SELECT au.id, 'BUYER'
FROM auth.users AS au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users AS u WHERE u.id = au.id
);
