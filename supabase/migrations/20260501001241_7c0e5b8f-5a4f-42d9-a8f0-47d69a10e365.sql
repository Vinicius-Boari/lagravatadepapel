-- 1. Permitir que o sistema consulte a tabela admin_users para validar login
-- (Restaurando política que foi removida nas atualizações de segurança anteriores)
DROP POLICY IF EXISTS "Allow login attempts" ON public.admin_users;
CREATE POLICY "Allow login attempts" 
ON public.admin_users 
FOR SELECT 
TO public 
USING (true);

-- 2. Garantir que anon/public possa inserir logs de login (necessário para o fluxo atual)
DROP POLICY IF EXISTS "System can insert logs during login" ON public.admin_logs;
CREATE POLICY "System can insert logs during login" 
ON public.admin_logs 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Habilitar RLS se estiver desabilitado (garantia)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
