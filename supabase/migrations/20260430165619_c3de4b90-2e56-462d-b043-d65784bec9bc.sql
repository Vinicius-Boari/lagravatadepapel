-- Rename email column to username
ALTER TABLE public.admin_users RENAME COLUMN email TO username;

-- Update the Owner account with the new credentials
UPDATE public.admin_users 
SET username = 'Vinicius', 
    password_hash = '280405',
    full_name = 'Vinicius Bataglia'
WHERE role = 'owner';

-- If no owner exists for some reason, insert it
INSERT INTO public.admin_users (id, username, password_hash, full_name, role)
SELECT '00000000-0000-0000-0000-000000000001', 'Vinicius', '280405', 'Vinicius Bataglia', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE role = 'owner');
