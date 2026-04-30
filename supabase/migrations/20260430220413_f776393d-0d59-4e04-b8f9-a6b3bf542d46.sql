-- Corrigir política de logs excessivamente permissiva
-- Alterar para permitir apenas usuários autenticados (mesmo que sem role admin) inserirem logs,
-- ou manter como service_role apenas se for o caso. Como o frontend insere logs de login,
-- permitiremos authenticated para garantir o fluxo, mas removeremos o 'anon'.

DROP POLICY IF EXISTS "System can insert logs" ON public.admin_logs;
CREATE POLICY "Authenticated users can insert logs" ON public.admin_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- Garantir que anon não possa inserir nada
REVOKE INSERT ON public.admin_logs FROM anon;
