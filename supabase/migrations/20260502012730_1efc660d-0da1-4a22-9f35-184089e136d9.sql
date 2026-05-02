ALTER TABLE public.backup_settings 
ADD COLUMN IF NOT EXISTS backup_type TEXT DEFAULT 'Supabase (Nativo)',
ADD COLUMN IF NOT EXISTS bucket_name TEXT DEFAULT 'backups',
ADD COLUMN IF NOT EXISTS backup_path TEXT DEFAULT '/data/backups';

-- Update existing record if it exists
UPDATE public.backup_settings 
SET 
  backup_type = 'Supabase (Nativo)',
  bucket_name = 'backups',
  backup_path = '/data/backups'
WHERE backup_type IS NULL;
