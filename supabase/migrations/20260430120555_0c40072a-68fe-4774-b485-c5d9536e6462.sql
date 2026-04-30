-- Enum de cargos
CREATE TYPE public.app_role AS ENUM ('owner', 'admin');

-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tabela de cargos
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Apenas um único Dono no sistema
CREATE UNIQUE INDEX only_one_owner ON public.user_roles (role) WHERE role = 'owner';

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função has_role (security definer evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função is_owner (helper)
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'owner'
  )
$$;

-- RLS profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Owner can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_owner(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Owner can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_owner(auth.uid()));

-- RLS user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_owner(auth.uid()));

CREATE POLICY "Owner can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Owner can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.is_owner(auth.uid()) AND role <> 'owner');

-- Trigger ao criar usuário: cria profile + atribui cargo admin (a posse é manual)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para transferir a posse atomicamente
CREATE OR REPLACE FUNCTION public.transfer_ownership(_new_owner_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_owner UUID;
BEGIN
  -- Apenas o Dono atual pode transferir
  IF NOT public.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o Dono pode transferir a posse';
  END IF;

  -- Novo dono precisa existir
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _new_owner_id) THEN
    RAISE EXCEPTION 'Usuário destino não encontrado';
  END IF;

  IF _new_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Você já é o Dono';
  END IF;

  _current_owner := auth.uid();

  -- Remove posse atual e rebaixa para admin
  DELETE FROM public.user_roles WHERE user_id = _current_owner AND role = 'owner';
  INSERT INTO public.user_roles (user_id, role) VALUES (_current_owner, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Promove novo dono e remove cargo admin redundante
  DELETE FROM public.user_roles WHERE user_id = _new_owner_id AND role = 'admin';
  INSERT INTO public.user_roles (user_id, role) VALUES (_new_owner_id, 'owner');
END;
$$;

-- Função para o Dono criar novos administradores (server-side via edge function depois)
-- Função para o Dono deletar usuário
CREATE OR REPLACE FUNCTION public.delete_admin_user(_target_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o Dono pode remover usuários';
  END IF;
  IF public.is_owner(_target_id) THEN
    RAISE EXCEPTION 'Não é possível remover o Dono';
  END IF;
  DELETE FROM auth.users WHERE id = _target_id;
END;
$$;