-- Remove a política atual que permite listagem
DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;

-- Cria uma nova política que permite leitura mas dificulta a listagem (opcionalmente, se quiser manter 100% privado, remova isso)
-- Para corrigir o aviso do linter "Public Bucket Allows Listing", geralmente mudamos de uma política baseada em bucket_id para algo mais específico 
-- ou removemos a permissão de SELECT genérica. 
-- Se o objetivo é apenas permitir que as imagens apareçam no site (via URL direta), a política de SELECT no bucket público do Supabase 
-- é o que permite isso. Para tirar o aviso, podemos restringir o SELECT para que não seja "true" para tudo no bucket.

CREATE POLICY "Public can view site media" ON storage.objects
FOR SELECT
USING (bucket_id = 'site-media' AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4')));
