
-- Remover FK que referencia admin_users
ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_user_id_fkey;

-- Remover a tabela admin_users (sistema antigo de login com senhas em texto puro)
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Remover o tipo enum admin_role que não é mais usado (era usado apenas em admin_users.role)
DROP TYPE IF EXISTS public.admin_role;
