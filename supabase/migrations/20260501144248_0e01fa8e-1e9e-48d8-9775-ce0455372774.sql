-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('midias', 'midias', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'midias');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'midias' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'midias' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'midias' AND auth.role() = 'authenticated');