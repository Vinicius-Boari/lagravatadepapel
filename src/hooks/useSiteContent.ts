import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SiteContent = Record<string, any>;

export const FALLBACK_CONTENT: SiteContent = {
  hero: {
    title_lines: ["Vamos", "Invadir", "Seu Evento"],
    subtitle: "A hora da gravata\nnunca mais será\na mesma /",
    location: "São Paulo\nCapital",
    cta_label: "EXECUTAR O PLANO",
    cta_url: "https://api.whatsapp.com/send?phone=5511985111012",
    images: [],
    video_url: "",
  },
  visual: {
    primary_color: "#c0392b",
    secondary_color: "#ffffff",
    background_color: "#0a0a0a",
    text_color: "#ffffff",
    font_family: "Playfair Display",
    logo_url: "",
    favicon_url: "",
  },
  services: { heading: "Nossos", heading_em: "Serviços", items: [] },
  videos: { heading: "Em", heading_em: "Movimento", items: [] },
  plan: { heading: "O Plano É", heading_em: "Surpreender", text: "", cta_label: "Contrate Agora", cta_url: "#" },
  places: { heading: "Nossas", heading2: "Invasões", instagram_url: "#", items: [] },
  about: { heading: "La Gravata", heading_em: "de Papel", image: "", paragraphs: [], cta_label: "Fale Conosco", cta_url: "#" },
  instagram_config: {
    handle: "lagravatadepapel",
    profile_url: "https://www.instagram.com/lagravatadepapel",
    title: "Siga no Instagram",
    subtitle: "Os bastidores das nossas invasões.",
    mode: "manual",
    access_token: "",
    app_id: "",
    app_secret: "",
  },
  integrations: {
    google_analytics_id: "",
    google_tag_manager_id: "",
    facebook_pixel_id: "",
    whatsapp_number: "5511985111012",
    whatsapp_message: "Olá, gostaria de saber mais sobre a La Gravata de Papel.",
  },
  footer: {
    phone: "", phone_url: "#", address_line1: "", address_line2: "",
    instagram_url: "#", whatsapp_url: "#",
    copyright: "© La Gravata de Papel", hashtag: "#LAGRAVATADEPAPEL",
  },
  seo: {
    title: "La Gravata de Papel",
    description: "A hora da gravata nunca mais será a mesma.",
    keywords: "gravata, casamento, festa, animação, invasão",
  },
  languages: {
    default: "pt",
    enabled: ["pt"],
    translations: {
      pt: { name: "Português", flag: "🇧🇷" },
      en: { name: "English", flag: "🇺🇸" },
      es: { name: "Español", flag: "🇪🇸" }
    }
  }
};

export function useSiteContent(useDraft = false) {
  const [content, setContent] = useState<SiteContent>(FALLBACK_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value, draft_value");
      
      if (!error && data) {
        const merged: SiteContent = { ...FALLBACK_CONTENT };
        for (const row of data) {
          const v = useDraft && row.draft_value ? row.draft_value : row.value;
          merged[row.key] = { ...(FALLBACK_CONTENT[row.key] ?? {}), ...(v as object) };
        }
        setContent(merged);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [useDraft]);

  const updateSection = async (key: string, newValue: any, isDraft = true) => {
    try {
      const updateData = isDraft ? { draft_value: newValue } : { value: newValue };
      
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, ...updateData });

      if (error) throw error;
      
      toast.success(isDraft ? "Rascunho salvo!" : "Alterações publicadas!");
      await fetchContent();
      return true;
    } catch (err) {
      console.error("Error updating content:", err);
      toast.error("Erro ao salvar alterações.");
      return false;
    }
  };

  return { content, loading, updateSection, refresh: fetchContent };
}