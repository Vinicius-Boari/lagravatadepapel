-- 1. Setup new schema
CREATE SCHEMA IF NOT EXISTS auth_utils;

-- 2. Create functions in the new schema with SECURITY DEFINER and explicit search_path
CREATE OR REPLACE FUNCTION auth_utils.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION auth_utils.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION auth_utils.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth_utils.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auth_utils.promote_first_user_to_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auth_utils.transfer_ownership(_new_owner_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_owner UUID;
BEGIN
  IF NOT auth_utils.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o Dono pode transferir a posse';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _new_owner_id) THEN
    RAISE EXCEPTION 'Usuário destino não encontrado';
  END IF;

  IF _new_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Você já é o Dono';
  END IF;

  _current_owner := auth.uid();

  DELETE FROM public.user_roles WHERE user_id = _current_owner AND role = 'owner';
  INSERT INTO public.user_roles (user_id, role) VALUES (_current_owner, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles WHERE user_id = _new_owner_id AND role = 'admin';
  INSERT INTO public.user_roles (user_id, role) VALUES (_new_owner_id, 'owner');
END;
$$;

CREATE OR REPLACE FUNCTION auth_utils.delete_admin_user(_target_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT auth_utils.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o Dono pode remover usuários';
  END IF;
  IF auth_utils.is_owner(_target_id) THEN
    RAISE EXCEPTION 'Não é possível remover o Dono';
  END IF;
  DELETE FROM auth.users WHERE id = _target_id;
END;
$$;

-- 3. Update Triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth_utils.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_promote_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth_utils.promote_first_user_to_owner();

-- 4. Update RLS Policies to use the new schema
-- Profiles
DROP POLICY IF EXISTS "Owner can view all profiles" ON public.profiles;
CREATE POLICY "Owner can view all profiles" ON public.profiles FOR SELECT USING (auth_utils.is_owner(auth.uid()));

DROP POLICY IF EXISTS "Owner can update any profile" ON public.profiles;
CREATE POLICY "Owner can update any profile" ON public.profiles FOR UPDATE USING (auth_utils.is_owner(auth.uid()));

-- User Roles
DROP POLICY IF EXISTS "Owner can view all roles" ON public.user_roles;
CREATE POLICY "Owner can view all roles" ON public.user_roles FOR SELECT USING (auth_utils.is_owner(auth.uid()));

DROP POLICY IF EXISTS "Owner can insert roles" ON public.user_roles;
CREATE POLICY "Owner can insert roles" ON public.user_roles FOR INSERT WITH CHECK (auth_utils.is_owner(auth.uid()));

DROP POLICY IF EXISTS "Owner can delete roles" ON public.user_roles;
CREATE POLICY "Owner can delete roles" ON public.user_roles FOR DELETE USING (auth_utils.is_owner(auth.uid()) AND (role <> 'owner'::app_role));

-- Pages
DROP POLICY IF EXISTS "Admins can read all pages" ON public.pages;
CREATE POLICY "Admins can read all pages" ON public.pages FOR SELECT USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can insert pages" ON public.pages;
CREATE POLICY "Admins can insert pages" ON public.pages FOR INSERT WITH CHECK (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update pages" ON public.pages;
CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete pages" ON public.pages;
CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE USING (auth_utils.is_admin());

-- Instagram Posts
DROP POLICY IF EXISTS "Admins can read all instagram posts" ON public.instagram_posts;
CREATE POLICY "Admins can read all instagram posts" ON public.instagram_posts FOR SELECT USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can insert instagram posts" ON public.instagram_posts;
CREATE POLICY "Admins can insert instagram posts" ON public.instagram_posts FOR INSERT WITH CHECK (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update instagram posts" ON public.instagram_posts;
CREATE POLICY "Admins can update instagram posts" ON public.instagram_posts FOR UPDATE USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete instagram posts" ON public.instagram_posts;
CREATE POLICY "Admins can delete instagram posts" ON public.instagram_posts FOR DELETE USING (auth_utils.is_admin());

-- Backups
DROP POLICY IF EXISTS "Admins can view backups" ON public.backups;
CREATE POLICY "Admins can view backups" ON public.backups FOR SELECT USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can insert backups" ON public.backups;
CREATE POLICY "Admins can insert backups" ON public.backups FOR INSERT WITH CHECK (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update backups" ON public.backups;
CREATE POLICY "Admins can update backups" ON public.backups FOR UPDATE USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete backups" ON public.backups;
CREATE POLICY "Admins can delete backups" ON public.backups FOR DELETE USING (auth_utils.is_admin());

-- Backup Settings
DROP POLICY IF EXISTS "Admins can view backup settings" ON public.backup_settings;
CREATE POLICY "Admins can view backup settings" ON public.backup_settings FOR SELECT USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can insert backup settings" ON public.backup_settings;
CREATE POLICY "Admins can insert backup settings" ON public.backup_settings FOR INSERT WITH CHECK (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update backup settings" ON public.backup_settings;
CREATE POLICY "Admins can update backup settings" ON public.backup_settings FOR UPDATE USING (auth_utils.is_admin());

-- Site Content / Media / Settings
DROP POLICY IF EXISTS "Admins can manage content" ON public.site_content;
CREATE POLICY "Admins can manage content" ON public.site_content FOR ALL USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can manage media" ON public.site_media;
CREATE POLICY "Admins can manage media" ON public.site_media FOR ALL USING (auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can manage pages" ON public.site_pages;
CREATE POLICY "Admins can manage pages" ON public.site_pages FOR ALL USING (auth_utils.is_admin());

-- Admin Logs
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (auth_utils.is_admin());

-- Storage
DROP POLICY IF EXISTS "Admins can upload site media" ON storage.objects;
CREATE POLICY "Admins can upload site media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-media' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update site media" ON storage.objects;
CREATE POLICY "Admins can update site media" ON storage.objects FOR UPDATE USING (bucket_id = 'site-media' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete site media" ON storage.objects;
CREATE POLICY "Admins can delete site media" ON storage.objects FOR DELETE USING (bucket_id = 'site-media' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can read backup files" ON storage.objects;
CREATE POLICY "Admins can read backup files" ON storage.objects FOR SELECT USING (bucket_id = 'backups' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can upload backup files" ON storage.objects;
CREATE POLICY "Admins can upload backup files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'backups' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete backup files" ON storage.objects;
CREATE POLICY "Admins can delete backup files" ON storage.objects FOR DELETE USING (bucket_id = 'backups' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can delete midias" ON storage.objects;
CREATE POLICY "Admins can delete midias" ON storage.objects FOR DELETE USING (bucket_id = 'midias' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can update midias" ON storage.objects;
CREATE POLICY "Admins can update midias" ON storage.objects FOR UPDATE USING (bucket_id = 'midias' AND auth_utils.is_admin());

DROP POLICY IF EXISTS "Admins can upload midias" ON storage.objects;
CREATE POLICY "Admins can upload midias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'midias' AND auth_utils.is_admin());

-- 5. Revoke execute on old functions and delete them
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.transfer_ownership(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.delete_admin_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.promote_first_user_to_owner() CASCADE;

-- 6. Permissions for new schema
REVOKE ALL ON SCHEMA auth_utils FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA auth_utils FROM PUBLIC;

GRANT USAGE ON SCHEMA auth_utils TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.has_role(UUID, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.is_owner(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.transfer_ownership(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.delete_admin_user(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_utils.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION auth_utils.promote_first_user_to_owner() TO service_role;
