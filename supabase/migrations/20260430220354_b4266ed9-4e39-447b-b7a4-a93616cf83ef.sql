-- 1. Restringir execução de funções sensíveis
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 2. Corrigir Search Path de funções SECURITY DEFINER para evitar ataques de hijacking
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.is_owner(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.transfer_ownership(uuid) SET search_path = public;
ALTER FUNCTION public.delete_admin_user(uuid) SET search_path = public;

-- 3. Garantir que políticas administrativas usem autenticação forte
DROP POLICY IF EXISTS "Admins can manage content" ON public.site_content;
CREATE POLICY "Admins can manage content" ON public.site_content
FOR ALL TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage pages" ON public.site_pages;
CREATE POLICY "Admins can manage pages" ON public.site_pages
FOR ALL TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" ON public.site_settings
FOR ALL TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage media" ON public.site_media;
CREATE POLICY "Admins can manage media" ON public.site_media
FOR ALL TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage instagram posts" ON public.instagram_posts;
CREATE POLICY "Admins can manage instagram posts" ON public.instagram_posts
FOR ALL TO authenticated
USING (public.is_admin());
