-- Rename table if it exists as site_settings, or ensure site_content exists
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_settings') THEN
        ALTER TABLE public.site_settings RENAME TO site_content;
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    draft_value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure draft_value column exists
DO $$ BEGIN
    ALTER TABLE public.site_content ADD COLUMN draft_value JSONB;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Clean up policies and recreate
DROP POLICY IF EXISTS "Public can view settings" ON public.site_content;
DROP POLICY IF EXISTS "Public can view content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.site_content;

CREATE POLICY "Public can view content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON public.site_content FOR ALL USING (public.is_admin());
