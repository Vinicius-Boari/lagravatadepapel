-- Tabela única de conteúdo (key-value JSONB)
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Leitura pública (site público precisa ler)
CREATE POLICY "Public can read site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

-- Escrita: apenas Dono ou Admin
CREATE POLICY "Admins can insert site content"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
ON public.site_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_site_content_timestamp()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER site_content_updated
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_site_content_timestamp();

-- Storage bucket para mídias do site (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  104857600, -- 100 MB
  ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml','video/mp4','video/webm','video/quicktime']
);

-- Políticas Storage
CREATE POLICY "Public can view site media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-media');

CREATE POLICY "Admins can upload site media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-media' AND
  (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update site media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-media' AND
  (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can delete site media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-media' AND
  (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
);