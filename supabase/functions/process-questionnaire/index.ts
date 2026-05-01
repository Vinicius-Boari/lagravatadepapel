import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, targetEmail } = await req.json();

    if (!targetEmail || !formData) {
      throw new Error("Missing data");
    }

    // Prepare HTML content for the email
    const htmlContent = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #c0392b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Novo Questionário Recebido! 🧨</h1>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
          <p>Um novo questionário de evento foi enviado através do site La Gravata de Papel.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h2 style="color: #c0392b; font-size: 18px;">Detalhes do Evento</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Data:</td><td>${formData.event_date}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Tipo:</td><td>${formData.event_type}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Nome Principal:</td><td>${formData.primary_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Local:</td><td>${formData.venue_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Horário:</td><td>${formData.performance_time}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Cidade/UF:</td><td>${formData.city} - ${formData.municipality}</td></tr>
          </table>

          <h2 style="color: #c0392b; font-size: 18px; margin-top: 30px;">Contato</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Responsável:</td><td>${formData.contact_person_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Telefone:</td><td>${formData.contact_person_phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Rede Social:</td><td>${formData.social_media_1}</td></tr>
          </table>

          <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #c0392b;">
            <p style="margin: 0; font-weight: bold;">Informações de Pagamento (Pix):</p>
            <p style="margin: 5px 0 0 0;">Chave: ${formData.pix_key} (${formData.pix_key_type})</p>
            <p style="margin: 5px 0 0 0;">Titular: ${formData.pix_holder_name}</p>
          </div>
        </div>
        <div style="background-color: #f5f5f5; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Este é um e-mail automático enviado pelo sistema La Gravata de Papel.
        </div>
      </div>
    `;

    // Since custom email is not set up, we just log and return success
    // The user needs to complete the email setup to actually send emails
    console.log("Questionnaire data for:", targetEmail);
    console.log("Data:", formData);

    return new Response(
      JSON.stringify({ 
        message: "Questionário processado. (Nota: Para o envio real de e-mails, a configuração de domínio personalizada deve ser concluída no painel do Lovable Cloud)",
        success: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-questionnaire:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
