-- Páginas extras criadas via CMS
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON public.pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger de timestamp + updated_by (reutiliza função existente)
CREATE TRIGGER pages_set_timestamp
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_site_content_timestamp();

-- Suporte a rascunho em site_content (para preview antes de publicar)
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS draft_value JSONB;

-- Storage policies para o bucket site-media
DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;
CREATE POLICY "Public can view site media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Admins can upload site media" ON storage.objects;
CREATE POLICY "Admins can upload site media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-media'
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

DROP POLICY IF EXISTS "Admins can update site media" ON storage.objects;
CREATE POLICY "Admins can update site media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-media'
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

DROP POLICY IF EXISTS "Admins can delete site media" ON storage.objects;
CREATE POLICY "Admins can delete site media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-media'
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );