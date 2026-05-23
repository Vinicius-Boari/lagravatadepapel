INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'public-assets');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-assets');