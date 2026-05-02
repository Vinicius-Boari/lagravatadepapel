
-- Trigger: promove o primeiro usuário cadastrado a owner automaticamente.
-- Após isso, novos cadastros recebem apenas papel padrão (sem privilégios).
CREATE OR REPLACE FUNCTION public.promote_first_user_to_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Garantir que existe um profile (idempotente)
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Se ainda não há nenhum owner, este usuário se torna o owner
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_promote_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_first_user_to_owner();

-- Permitir que admins/owners vejam todos os profiles (para a tela de gestão de usuários)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));
