-- Tabela de posts do Instagram (modo manual / híbrido)
CREATE TABLE public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  permalink text,
  position integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'manual', -- 'manual' | 'graph_api'
  external_id text, -- id do post quando vier da Graph API
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published instagram posts"
  ON public.instagram_posts FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all instagram posts"
  ON public.instagram_posts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert instagram posts"
  ON public.instagram_posts FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update instagram posts"
  ON public.instagram_posts FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete instagram posts"
  ON public.instagram_posts FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_instagram_posts_updated
BEFORE UPDATE ON public.instagram_posts
FOR EACH ROW EXECUTE FUNCTION public.update_site_content_timestamp();

-- Seed: garante uma chave de configuração do Instagram em site_content
INSERT INTO public.site_content (key, value)
VALUES ('instagram_config', '{"handle":"lagravatadepapel","profile_url":"https://www.instagram.com/lagravatadepapel","title":"Siga no Instagram","subtitle":"@lagravatadepapel","mode":"manual","auto_sync":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;