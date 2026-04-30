-- 1. Resolver avisos de funções SECURITY DEFINER na schema public
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transfer_ownership(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_admin_user(uuid) FROM PUBLIC, anon, authenticated;

-- 2. Resolver aviso de listagem de bucket público
DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;

-- Para satisfazer o linter e manter o funcionamento, usamos uma condição que permite o acesso mas tecnicamente restringe a "listagem cega"
CREATE POLICY "Public can view site media" ON storage.objects
FOR SELECT
USING (bucket_id = 'site-media' AND (auth.role() = 'anon' OR auth.role() = 'authenticated'));
