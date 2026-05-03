CREATE OR REPLACE FUNCTION public.validate_questionnaire_response()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.primary_name IS NULL OR char_length(trim(NEW.primary_name)) = 0 OR char_length(NEW.primary_name) > 200 THEN
    RAISE EXCEPTION 'Nome inválido';
  END IF;
  IF NEW.secondary_name IS NOT NULL AND char_length(NEW.secondary_name) > 200 THEN
    RAISE EXCEPTION 'Nome secundário muito longo';
  END IF;
  IF NEW.contact_person_name IS NULL OR char_length(trim(NEW.contact_person_name)) = 0 OR char_length(NEW.contact_person_name) > 200 THEN
    RAISE EXCEPTION 'Nome de contato inválido';
  END IF;
  IF NEW.contact_person_phone IS NULL OR char_length(NEW.contact_person_phone) < 8 OR char_length(NEW.contact_person_phone) > 30 THEN
    RAISE EXCEPTION 'Telefone inválido';
  END IF;
  IF NEW.event_type IS NULL OR char_length(NEW.event_type) > 100 THEN
    RAISE EXCEPTION 'Tipo de evento inválido';
  END IF;
  IF NEW.venue_name IS NULL OR char_length(NEW.venue_name) > 300 THEN
    RAISE EXCEPTION 'Local inválido';
  END IF;
  IF NEW.address IS NULL OR char_length(NEW.address) > 500 THEN
    RAISE EXCEPTION 'Endereço inválido';
  END IF;
  IF NEW.city IS NULL OR char_length(NEW.city) > 150 THEN
    RAISE EXCEPTION 'Cidade inválida';
  END IF;
  IF NEW.municipality IS NULL OR char_length(NEW.municipality) > 150 THEN
    RAISE EXCEPTION 'Município inválido';
  END IF;
  IF NEW.zip_code IS NULL OR char_length(NEW.zip_code) > 20 THEN
    RAISE EXCEPTION 'CEP inválido';
  END IF;
  IF NEW.complement IS NOT NULL AND char_length(NEW.complement) > 300 THEN
    RAISE EXCEPTION 'Complemento muito longo';
  END IF;
  IF NEW.observations IS NOT NULL AND char_length(NEW.observations) > 5000 THEN
    RAISE EXCEPTION 'Observações muito longas';
  END IF;
  IF NEW.other_extra_services IS NOT NULL AND char_length(NEW.other_extra_services) > 2000 THEN
    RAISE EXCEPTION 'Texto muito longo';
  END IF;
  IF NEW.other_allowed_items IS NOT NULL AND char_length(NEW.other_allowed_items) > 2000 THEN
    RAISE EXCEPTION 'Texto muito longo';
  END IF;
  IF NEW.how_did_you_hear_about_us IS NOT NULL AND char_length(NEW.how_did_you_hear_about_us) > 500 THEN
    RAISE EXCEPTION 'Texto muito longo';
  END IF;
  IF NEW.selected_coupon IS NOT NULL AND char_length(NEW.selected_coupon) > 100 THEN
    RAISE EXCEPTION 'Cupom inválido';
  END IF;
  IF NEW.invasion_type IS NOT NULL AND char_length(NEW.invasion_type) > 100 THEN
    RAISE EXCEPTION 'Tipo de invasão inválido';
  END IF;
  IF NEW.character_count IS NOT NULL AND char_length(NEW.character_count) > 50 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF NEW.stay_duration IS NOT NULL AND char_length(NEW.stay_duration) > 50 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF NEW.has_screen IS NOT NULL AND char_length(NEW.has_screen) > 50 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF NEW.parking_payment_pref IS NOT NULL AND char_length(NEW.parking_payment_pref) > 100 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF NEW.is_aware_of_card_fees IS NOT NULL AND char_length(NEW.is_aware_of_card_fees) > 50 THEN
    RAISE EXCEPTION 'Valor inválido';
  END IF;
  IF NEW.pix_key IS NOT NULL AND char_length(NEW.pix_key) > 255 THEN
    RAISE EXCEPTION 'Chave PIX inválida';
  END IF;
  IF NEW.pix_holder_name IS NOT NULL AND char_length(NEW.pix_holder_name) > 200 THEN
    RAISE EXCEPTION 'Nome do titular inválido';
  END IF;
  IF NEW.pix_key_type IS NOT NULL AND char_length(NEW.pix_key_type) > 50 THEN
    RAISE EXCEPTION 'Tipo de chave PIX inválido';
  END IF;
  IF NEW.pix_bank IS NOT NULL AND char_length(NEW.pix_bank) > 150 THEN
    RAISE EXCEPTION 'Banco inválido';
  END IF;
  IF NEW.pix_qr_code_url IS NOT NULL AND (char_length(NEW.pix_qr_code_url) > 1000 OR NEW.pix_qr_code_url !~* '^https?://') THEN
    RAISE EXCEPTION 'URL do QR Code inválida';
  END IF;
  IF NEW.social_media_1 IS NOT NULL AND char_length(NEW.social_media_1) > 500 THEN
    RAISE EXCEPTION 'Rede social inválida';
  END IF;
  IF NEW.social_media_2 IS NOT NULL AND char_length(NEW.social_media_2) > 500 THEN
    RAISE EXCEPTION 'Rede social inválida';
  END IF;
  IF NEW.social_media_3 IS NOT NULL AND char_length(NEW.social_media_3) > 500 THEN
    RAISE EXCEPTION 'Rede social inválida';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_questionnaire_response_trigger ON public.questionnaire_responses;
CREATE TRIGGER validate_questionnaire_response_trigger
  BEFORE INSERT OR UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.validate_questionnaire_response();