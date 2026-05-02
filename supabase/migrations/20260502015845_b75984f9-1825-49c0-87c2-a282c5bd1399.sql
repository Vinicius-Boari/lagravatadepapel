-- Revoke public/anon EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.owner_exists() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb) FROM PUBLIC, anon;

-- log_admin_action: only authenticated users (function still enforces auth.uid() internally)
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb) TO authenticated;

-- owner_exists: needed by bootstrap-owner edge function (uses service role, which bypasses grants)
-- and is safe to expose to authenticated users (returns only a boolean)
GRANT EXECUTE ON FUNCTION public.owner_exists() TO authenticated;