
-- Tabela de backups
CREATE TABLE public.backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','success','error')),
  size_bytes BIGINT NOT NULL DEFAULT 0,
  file_path TEXT,
  tables JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual','auto')),
  created_by UUID
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backups" ON public.backups FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert backups" ON public.backups FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update backups" ON public.backups FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete backups" ON public.backups FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_backups_created_at ON public.backups (created_at DESC);

-- Tabela de configurações
CREATE TABLE public.backup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_enabled BOOLEAN NOT NULL DEFAULT true,
  interval_value INT NOT NULL DEFAULT 2,
  interval_unit TEXT NOT NULL DEFAULT 'hours' CHECK (interval_unit IN ('minutes','hours','days')),
  retention_count INT NOT NULL DEFAULT 10,
  retention_days INT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE
);

ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backup settings" ON public.backup_settings FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert backup settings" ON public.backup_settings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update backup settings" ON public.backup_settings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.backup_settings (auto_enabled, interval_value, interval_unit, retention_count)
VALUES (true, 2, 'hours', 10);

-- Bucket privado para arquivos
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can read backup files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'backups' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins can upload backup files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'backups' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins can delete backup files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'backups' AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
