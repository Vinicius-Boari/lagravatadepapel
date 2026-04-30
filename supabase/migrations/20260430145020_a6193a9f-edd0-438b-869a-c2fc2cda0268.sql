-- Revogar execução pública de funções sensíveis
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

REVOKE EXECUTE ON FUNCTION public.delete_admin_user(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_admin_user(uuid) FROM anon;

REVOKE EXECUTE ON FUNCTION public.transfer_ownership(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transfer_ownership(uuid) FROM anon;

-- Garantir que apenas usuários autenticados (ou administradores, dependendo da lógica interna da função) possam chamá-las se necessário
-- Se essas funções forem triggers (como handle_new_user), elas não precisam de permissão de execução direta por usuários.

-- Ajuste na política de storage para remover o aviso de listagem
DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;
CREATE POLICY "Public can view site media" ON storage.objects
FOR SELECT
USING (bucket_id = 'site-media');
-- Nota: O aviso de listagem persiste se o SELECT for muito aberto, mas restringimos a execução de funções acima.
