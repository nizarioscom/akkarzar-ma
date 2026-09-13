-- Apply after `prisma migrate` against a Supabase project.
-- Prisma cannot model `auth.users`; this FK keeps public.users 1:1 with Auth.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_id_fk_auth_users'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fk_auth_users
      FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END $$;
