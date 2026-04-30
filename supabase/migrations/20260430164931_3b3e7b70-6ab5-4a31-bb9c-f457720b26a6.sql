-- Drop the restrictive policy that blocks login
DROP POLICY IF EXISTS "Public can't see admin users" ON public.admin_users;

-- Create a policy that allows the login query to work
-- In this specific custom setup, we need the application to be able to find the user by email/password
CREATE POLICY "Allow login attempts" ON public.admin_users 
FOR SELECT USING (true);

-- Ensure admin_logs can be inserted during login without auth
DROP POLICY IF EXISTS "System can insert logs" ON public.admin_logs;
CREATE POLICY "System can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (true);
