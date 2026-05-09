-- Attach validation trigger to questionnaire_responses
DROP TRIGGER IF EXISTS validate_questionnaire_response_trigger ON public.questionnaire_responses;
CREATE TRIGGER validate_questionnaire_response_trigger
  BEFORE INSERT OR UPDATE ON public.questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_questionnaire_response();

-- Hard length caps as a defense-in-depth in addition to the trigger
ALTER TABLE public.questionnaire_responses
  ALTER COLUMN primary_name TYPE varchar(200),
  ALTER COLUMN secondary_name TYPE varchar(200),
  ALTER COLUMN contact_person_name TYPE varchar(200),
  ALTER COLUMN contact_person_phone TYPE varchar(30),
  ALTER COLUMN event_type TYPE varchar(100),
  ALTER COLUMN venue_name TYPE varchar(300),
  ALTER COLUMN address TYPE varchar(500),
  ALTER COLUMN city TYPE varchar(150),
  ALTER COLUMN municipality TYPE varchar(150),
  ALTER COLUMN zip_code TYPE varchar(20),
  ALTER COLUMN complement TYPE varchar(300),
  ALTER COLUMN observations TYPE varchar(5000),
  ALTER COLUMN other_extra_services TYPE varchar(2000),
  ALTER COLUMN other_allowed_items TYPE varchar(2000),
  ALTER COLUMN how_did_you_hear_about_us TYPE varchar(500),
  ALTER COLUMN selected_coupon TYPE varchar(100),
  ALTER COLUMN invasion_type TYPE varchar(100),
  ALTER COLUMN character_count TYPE varchar(50),
  ALTER COLUMN stay_duration TYPE varchar(50),
  ALTER COLUMN has_screen TYPE varchar(50),
  ALTER COLUMN parking_payment_pref TYPE varchar(100),
  ALTER COLUMN is_aware_of_card_fees TYPE varchar(50),
  ALTER COLUMN pix_key TYPE varchar(255),
  ALTER COLUMN pix_holder_name TYPE varchar(200),
  ALTER COLUMN pix_key_type TYPE varchar(50),
  ALTER COLUMN pix_bank TYPE varchar(150),
  ALTER COLUMN pix_qr_code_url TYPE varchar(1000),
  ALTER COLUMN social_media_1 TYPE varchar(500),
  ALTER COLUMN social_media_2 TYPE varchar(500),
  ALTER COLUMN social_media_3 TYPE varchar(500);