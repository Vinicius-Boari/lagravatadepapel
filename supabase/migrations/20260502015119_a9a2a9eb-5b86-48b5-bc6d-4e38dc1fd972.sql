
-- 1. Fix admin_logs: remove permissive INSERT policy, replace with SECURITY DEFINER function
DROP POLICY IF EXISTS "System can insert logs during login" ON public.admin_logs;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action text,
  _entity_type text DEFAULT NULL,
  _entity_id text DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();
  IF _email IS NULL THEN
    _email := COALESCE((auth.jwt() ->> 'email'), 'unknown');
  END IF;

  INSERT INTO public.admin_logs (action, user_email, user_id, entity_type, entity_id, details)
  VALUES (_action, _email, auth.uid(), _entity_type, _entity_id, _details)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_admin_action(text, text, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, text, jsonb) TO authenticated;

-- 2. Fix questionnaire_responses: add explicit admin-only SELECT policy
CREATE POLICY "Admins can view questionnaire responses"
ON public.questionnaire_responses
FOR SELECT
USING (auth_utils.is_admin());

-- 3. Fix user_roles: remove public owner-row exposure, replace with boolean function
DROP POLICY IF EXISTS "Public can check if owner exists" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.owner_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner'::app_role);
$$;

REVOKE ALL ON FUNCTION public.owner_exists() FROM public;
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;
