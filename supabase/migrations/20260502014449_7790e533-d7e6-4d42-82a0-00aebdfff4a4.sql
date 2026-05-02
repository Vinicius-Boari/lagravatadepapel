-- 1. Tighten Function Permissions
-- First revoke all from public
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_owner(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transfer_ownership(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_admin_user(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_first_user_to_owner() FROM PUBLIC;

-- Grant only to necessary roles
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_owner(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.transfer_ownership(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_admin_user(UUID) TO authenticated, service_role;

-- handle_new_user and promote_first_user_to_owner are trigger functions,
-- they generally only need to be executable by the service_role or the system.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_first_user_to_owner() TO service_role;

-- 2. Update RLS Policies for admin_logs and questionnaire_responses
DROP POLICY IF EXISTS "System can insert logs during login" ON public.admin_logs;
CREATE POLICY "System can insert logs during login"
ON public.admin_logs
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can submit responses" ON public.questionnaire_responses;
CREATE POLICY "Public can submit responses"
ON public.questionnaire_responses
FOR INSERT
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- 3. Improve Storage Policies to address "Public Bucket Allows Listing"
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access to midias"
ON storage.objects
FOR SELECT
USING (bucket_id = 'midias' AND (auth.role() = 'anon' OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;
CREATE POLICY "Public can view site media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-media' AND (auth.role() = 'anon' OR auth.role() = 'authenticated'));
