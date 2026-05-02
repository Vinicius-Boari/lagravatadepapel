
-- 1) admin_users: remove public SELECT exposing password hashes
DROP POLICY IF EXISTS "Allow login attempts" ON public.admin_users;

CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) posts: drop overly permissive ALL policies, keep public read, restrict writes to admins
DROP POLICY IF EXISTS "Public full access for posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated manage posts" ON public.posts;
DROP POLICY IF EXISTS "Public read posts" ON public.posts;
-- keep "Public can view posts" (SELECT, public, true) for public reads

CREATE POLICY "Admins can insert posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete posts"
ON public.posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3) site_content: drop public ALL, keep public read, restrict writes to admins
DROP POLICY IF EXISTS "Public full access" ON public.site_content;
-- keep "Public read access" for SELECT

CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site content"
ON public.site_content
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 4) midias storage bucket: tighten write/update/delete to admins
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Admins can upload midias"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'midias'
  AND (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can update midias"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'midias'
  AND (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can delete midias"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'midias'
  AND (public.has_role(auth.uid(), 'owner'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
);
