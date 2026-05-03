ALTER TABLE public.questionnaire_responses 
ADD COLUMN IF NOT EXISTS invasion_type TEXT,
ADD COLUMN IF NOT EXISTS selected_coupon TEXT;