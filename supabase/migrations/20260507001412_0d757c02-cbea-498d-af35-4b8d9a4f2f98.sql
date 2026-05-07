-- 1) Remove adminEmail field from public site_content settings to prevent any future leak
UPDATE public.site_content
SET value = value - 'adminEmail'
WHERE key = 'settings' AND value ? 'adminEmail';

-- 2) Lock down SECURITY DEFINER functions: revoke EXECUTE from authenticated.
--    These are not called from client code; bootstrap-owner & log paths use service role.
REVOKE EXECUTE ON FUNCTION public.owner_exists() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb) FROM authenticated, anon, PUBLIC;