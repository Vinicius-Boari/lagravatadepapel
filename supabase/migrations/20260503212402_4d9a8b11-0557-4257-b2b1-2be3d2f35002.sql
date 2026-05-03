-- Update site-media bucket configurations
UPDATE storage.buckets 
SET allowed_mime_types = '{image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime}',
    file_size_limit = 52428800
WHERE id = 'site-media';

-- Update midias bucket configurations
UPDATE storage.buckets 
SET allowed_mime_types = '{image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime}',
    file_size_limit = 52428800
WHERE id = 'midias';
