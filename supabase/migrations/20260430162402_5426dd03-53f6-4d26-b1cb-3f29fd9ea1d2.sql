-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_roles' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'user_roles_user_id_key'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Set owner role
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'viniciusbataglia500@gmail.com';

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email)
    VALUES (v_user_id, 'viniciusbataglia500@gmail.com')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'owner')
    ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
  END IF;
END $$;