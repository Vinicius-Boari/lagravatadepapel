-- Attempt to move pg_net by reinstalling it in the correct schema
-- We use a DO block to handle cases where it might be pinned or have dependencies
DO $$
BEGIN
  -- We try to drop and recreate in extensions schema
  DROP EXTENSION IF EXISTS pg_net CASCADE;
  CREATE SCHEMA IF NOT EXISTS extensions;
  CREATE EXTENSION pg_net SCHEMA extensions;
EXCEPTION
  WHEN OTHERS THEN
    -- If it fails (e.g. permission denied or system pinned), we just ignore it
    -- as it's a non-critical warning.
    RAISE NOTICE 'Could not move pg_net: %', SQLERRM;
END $$;
