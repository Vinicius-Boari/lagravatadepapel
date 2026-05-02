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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Configuração de e-mail (Resend) não encontrada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { formData: rawFormData, targetEmail } = await req.json();

    if (!targetEmail || !rawFormData) {
      throw new Error("Dados ausentes para processamento.");
    }

    // HTML-escape helper to prevent injection in email body
    const esc = (s: unknown): string =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Escape every field used in the template
    const formData: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawFormData)) {
      formData[k] = esc(v);
    }

    // Prepare HTML content for the email
    const htmlContent = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #c0392b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">La Gravata de Papel - Novo Questionário 🧨</h1>
        </div>
        <div style="padding: 20px; line-height: 1.6;">
          <p>Olá, você recebeu um novo questionário de evento!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h2 style="color: #c0392b; font-size: 18px;">Informações do Evento</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Data:</td><td>${formData.event_date}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Tipo:</td><td>${formData.event_type}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Cliente:</td><td>${formData.primary_name} ${formData.secondary_name || ""}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Local:</td><td>${formData.venue_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Horário:</td><td>${formData.performance_time}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Endereço:</td><td>${formData.address}, ${formData.city} - ${formData.municipality}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">CEP:</td><td>${formData.zip_code}</td></tr>
          </table>

          <h2 style="color: #c0392b; font-size: 18px; margin-top: 30px;">Contato e Detalhes</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Responsável:</td><td>${formData.contact_person_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Telefone:</td><td>${formData.contact_person_phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Rede Social:</td><td>${formData.social_media_1}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Como conheceu:</td><td>${formData.how_did_you_hear_about_us}</td></tr>
          </table>

          <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #c0392b;">
            <p style="margin: 0; font-weight: bold;">Informações de Pagamento (Pix):</p>
            <p style="margin: 5px 0 0 0;">Chave: ${formData.pix_key} (${formData.pix_key_type})</p>
            <p style="margin: 5px 0 0 0;">Titular: ${formData.pix_holder_name}</p>
            <p style="margin: 5px 0 0 0;">Banco: ${formData.pix_bank}</p>
          </div>

          <div style="margin-top: 20px;">
            <p><strong>Observações:</strong><br />${formData.observations || "Nenhuma observação informada."}</p>
          </div>
        </div>
        <div style="background-color: #f5f5f5; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Questionário enviado via site La Gravata de Papel.
        </div>
      </div>
    `;

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "La Gravata de Papel <onboarding@resend.dev>",
        to: [targetEmail],
        subject: `Novo Questionário: ${formData.primary_name} - ${formData.event_date}`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Erro ao enviar e-mail: ${errorData.message || "Erro desconhecido"}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in process-questionnaire:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
