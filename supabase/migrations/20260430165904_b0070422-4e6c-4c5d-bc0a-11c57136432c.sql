-- Drop existing table to ensure a clean start
DROP TABLE IF EXISTS public.admin_logs;
DROP TABLE IF EXISTS public.admin_users;

-- Recreate admin_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role admin_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for login (application needs to see record to verify password)
CREATE POLICY "Allow login attempts" ON public.admin_users FOR SELECT USING (true);

-- Create admin_logs table
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.admin_users(id),
    user_email TEXT NOT NULL, -- or username
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (true);

-- Insert the Owner account correctly
INSERT INTO public.admin_users (id, username, password_hash, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vinicius', '280405', 'Vinicius Bataglia', 'owner');
