UPDATE public.site_content
SET value = (value - 'app_id' - 'app_secret' - 'access_token'),
    draft_value = CASE WHEN draft_value IS NULL THEN NULL ELSE (draft_value - 'app_id' - 'app_secret' - 'access_token') END
WHERE key = 'instagram_config';