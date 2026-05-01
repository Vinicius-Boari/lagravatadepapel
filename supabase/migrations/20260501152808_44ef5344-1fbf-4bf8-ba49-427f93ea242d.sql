-- Criar função para verificar se o usuário é administrador (caso não exista)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.site_content;

-- Criar uma política única e robusta para gerenciamento por admins
CREATE POLICY "Admins can manage all site content" 
ON public.site_content 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Garantir que a tabela posts também tenha as mesmas permissões
DROP POLICY IF EXISTS "Auth users can manage posts" ON public.posts;
CREATE POLICY "Admins can manage posts" 
ON public.posts 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());