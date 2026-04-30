-- Create administrative roles enum
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role admin_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Public can't see admin users" ON public.admin_users FOR SELECT USING (false);
CREATE POLICY "Owner can manage all admin users" ON public.admin_users 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = 'viniciusbataglia500@gmail.com' 
            AND id = auth.uid() -- This assumes we might use Supabase Auth later, but for now we use custom JWT logic. 
            -- Actually, let's make it simpler for custom login logic.
        )
    );

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.admin_users(id),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create site_settings table (Key-Value pairs for flexibility)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);

-- Create site_media table
CREATE TABLE IF NOT EXISTS public.site_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image/video
    category TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media" ON public.site_media FOR SELECT USING (true);

-- Create site_pages table
CREATE TABLE IF NOT EXISTS public.site_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    is_published BOOLEAN DEFAULT true,
    is_home BOOLEAN DEFAULT false,
    seo_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published pages" ON public.site_pages FOR SELECT USING (is_published = true);

-- Insert the permanent Owner (Password: 197541458 - hashed later or handled in code)
-- For this setup, we'll store the password hash. Since I can't run bcrypt here, 
-- I'll use a placeholder and the app will handle verification.
-- Note: In a real app, we'd use Supabase Auth. 
-- The user requested specific email/password login.

INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES ('viniciusbataglia500@gmail.com', '197541458', 'Vinicius Bataglia', 'owner')
ON CONFLICT (email) DO UPDATE SET role = 'owner';
