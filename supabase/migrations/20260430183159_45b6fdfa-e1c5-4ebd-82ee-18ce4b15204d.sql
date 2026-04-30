-- Adiciona colunas para SEO e Idioma se não existirem (usando JSONB para flexibilidade)
ALTER TABLE public.site_content 
ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS language_config JSONB DEFAULT '{"default": "pt", "enabled": ["pt"]}'::jsonb;

-- Nota: Como site_content geralmente tem uma linha por seção ou uma linha global, 
-- essa alteração permite armazenar configurações globais de SEO e Idioma.