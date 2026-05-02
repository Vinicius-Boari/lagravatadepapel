-- Permitir que qualquer pessoa (incluindo usuários não logados) verifique se existe um owner.
-- Isso é necessário para a página de login decidir se mostra "Criar conta de dono" ou "Entrar".
CREATE POLICY "Public can check if owner exists"
ON public.user_roles
FOR SELECT
TO anon, authenticated
USING (role = 'owner');