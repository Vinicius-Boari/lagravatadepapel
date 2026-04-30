-- 1. Fix admin_logs: restrict INSERT to admins/owners only
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;

CREATE POLICY "Admins can insert logs"
ON public.admin_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view logs"
ON public.admin_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix is_admin() to use has_role against user_roles (real Supabase Auth UIDs)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'owner'::app_role)
$$;

-- 3. Lock down admin_users: remove public SELECT (was exposing plaintext passwords)
DROP POLICY IF EXISTS "Allow login attempts" ON public.admin_users;
-- No replacement policy: the table now has zero policies, so anon/authenticated cannot read it.
-- Custom-auth login flow that depended on direct client SELECTs will need to move server-side.

-- 4. Stop auto-granting 'admin' role to every new auth user (privilege escalation fix)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  -- Removed automatic admin role grant. Roles must be assigned explicitly via create-admin.
  RETURN NEW;
END;
$$;