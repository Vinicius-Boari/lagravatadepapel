-- Add missing policies for admin tables
-- We check for a session in the admin_users table to verify permission
-- In a real scenario, we'd use auth.uid() if using Supabase Auth,
-- but since we're implementing a custom login, we'll allow admins to manage these.
-- For now, let's create a helper function to check if a user is an admin.

CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a placeholder. For RLS to work with custom auth, 
  -- we usually need to set a custom claim or use Supabase Auth.
  -- Since we are building a custom dashboard, we will handle 
  -- verification in the application layer, but let's add basic 
  -- policies to allow the specific Owner email for now if we were using Auth.
  RETURN (SELECT role FROM public.admin_users WHERE id = auth.uid()) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for admin_logs
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (true);

-- Policies for site_settings
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Policies for site_media
CREATE POLICY "Admins can manage media" ON public.site_media FOR ALL USING (public.is_admin());

-- Policies for site_pages
CREATE POLICY "Admins can manage pages" ON public.site_pages FOR ALL USING (public.is_admin());
