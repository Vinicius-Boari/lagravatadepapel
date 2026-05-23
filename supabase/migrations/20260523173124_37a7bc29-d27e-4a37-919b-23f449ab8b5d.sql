
-- 1. Lock down brain_* tables: remove public write/all policies, allow admins to manage
DROP POLICY IF EXISTS "Public insert access for brain_knowledge" ON public.brain_knowledge;
DROP POLICY IF EXISTS "Public update access for brain_knowledge" ON public.brain_knowledge;
DROP POLICY IF EXISTS "Public insert access for brain_relationships" ON public.brain_relationships;
DROP POLICY IF EXISTS "Public insert access for brain_interactions" ON public.brain_interactions;
DROP POLICY IF EXISTS "Public access for search history" ON public.brain_search_history;
DROP POLICY IF EXISTS "Public access for search results" ON public.brain_search_results;

CREATE POLICY "Admins can insert brain_knowledge" ON public.brain_knowledge FOR INSERT TO authenticated WITH CHECK (auth_utils.is_admin());
CREATE POLICY "Admins can update brain_knowledge" ON public.brain_knowledge FOR UPDATE TO authenticated USING (auth_utils.is_admin());
CREATE POLICY "Admins can delete brain_knowledge" ON public.brain_knowledge FOR DELETE TO authenticated USING (auth_utils.is_admin());

CREATE POLICY "Admins can insert brain_relationships" ON public.brain_relationships FOR INSERT TO authenticated WITH CHECK (auth_utils.is_admin());

CREATE POLICY "Admins can insert brain_interactions" ON public.brain_interactions FOR INSERT TO authenticated WITH CHECK (auth_utils.is_admin());

CREATE POLICY "Admins can read brain_search_history" ON public.brain_search_history FOR SELECT TO authenticated USING (auth_utils.is_admin());
CREATE POLICY "Admins can insert brain_search_history" ON public.brain_search_history FOR INSERT TO authenticated WITH CHECK (auth_utils.is_admin());
CREATE POLICY "Admins can update brain_search_history" ON public.brain_search_history FOR UPDATE TO authenticated USING (auth_utils.is_admin());
CREATE POLICY "Admins can delete brain_search_history" ON public.brain_search_history FOR DELETE TO authenticated USING (auth_utils.is_admin());

CREATE POLICY "Admins can read brain_search_results" ON public.brain_search_results FOR SELECT TO authenticated USING (auth_utils.is_admin());
CREATE POLICY "Admins can insert brain_search_results" ON public.brain_search_results FOR INSERT TO authenticated WITH CHECK (auth_utils.is_admin());
CREATE POLICY "Admins can update brain_search_results" ON public.brain_search_results FOR UPDATE TO authenticated USING (auth_utils.is_admin());
CREATE POLICY "Admins can delete brain_search_results" ON public.brain_search_results FOR DELETE TO authenticated USING (auth_utils.is_admin());

-- 2. Restrict public-assets uploads to admins
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Admins can upload public-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-assets' AND auth_utils.is_admin());
CREATE POLICY "Admins can update public-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'public-assets' AND auth_utils.is_admin());
CREATE POLICY "Admins can delete public-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public-assets' AND auth_utils.is_admin());

-- 3. Prevent broad listing of public buckets (files still served via public bucket direct URLs)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to midias" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site media" ON storage.objects;

-- 4. Fix function search_path
CREATE OR REPLACE FUNCTION public.handle_brain_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
