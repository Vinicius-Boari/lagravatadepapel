-- Create a table for questionnaire responses
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  primary_name TEXT NOT NULL,
  secondary_name TEXT,
  venue_name TEXT NOT NULL,
  performance_time TIME NOT NULL,
  address TEXT NOT NULL,
  municipality TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  complement TEXT,
  is_assistant_aware BOOLEAN,
  parking_payment_pref TEXT,
  allowed_items JSONB DEFAULT '[]'::jsonb,
  other_allowed_items TEXT,
  has_screen TEXT,
  contact_person_name TEXT NOT NULL,
  contact_person_phone TEXT NOT NULL,
  extra_services JSONB DEFAULT '[]'::jsonb,
  other_extra_services TEXT,
  character_count TEXT,
  stay_duration TEXT,
  everyone_informed BOOLEAN,
  changing_room_informed BOOLEAN,
  pix_key TEXT,
  pix_holder_name TEXT,
  pix_key_type TEXT,
  pix_bank TEXT,
  pix_qr_code_url TEXT,
  is_aware_of_card_fees TEXT,
  observations TEXT,
  social_media_1 TEXT,
  social_media_2 TEXT,
  social_media_3 TEXT,
  how_did_you_hear_about_us TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can submit responses"
ON public.questionnaire_responses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view responses"
ON public.questionnaire_responses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
