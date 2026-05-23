/**
 * useSiteContent Hook
 * 
 * Manage and fetch global site content from Supabase.
 * Provides real-time updates and draft/published content switching.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteContent {
  hero: {
    title_lines: string[];
    subtitle: string;
    location: string;
    cta_label: string;
    cta_url: string;
    images: string[];
    video_url: string;
    show_video_mobile: boolean;
    seo_hidden_text?: string;
    image1?: string;
    image1_alt?: string;
    image1_show_mobile?: boolean;
    image2?: string;
    image2_alt?: string;
    image2_show_mobile?: boolean;
    image3?: string;
    image3_alt?: string;
    image3_show_mobile?: boolean;
  };
  visual: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    logo_url: string;
    favicon_url: string;
  };
  services: { heading: string; heading_em: string; items: Array<{ title: string; desc: string; img: string; show_mobile?: boolean }> };
  videos: { heading: string; heading_em: string; items: Array<{ title: string; tag: string; src: string; poster?: string; tall?: boolean; show_mobile?: boolean }> };
  plan: { heading: string; heading_em: string; text: string; cta_label: string; cta_url: string };
  places: { heading: string; heading2: string; instagram_url: string; items: Array<{ title: string; tag: string; img: string; show_mobile?: boolean }> };
  about: { heading: string; heading_em: string; image: string; paragraphs: string[]; cta_label: string; cta_url: string; show_mobile?: boolean };
  coupons: { heading: string; heading_em: string; items: Array<{ title: string; code: string; discount: string; description: string; link: string }> };
  instagram_config: { handle: string; profile_url: string; title: string; subtitle: string; mode: "manual" | "auto" };
  integrations: { google_analytics_id: string; google_tag_manager_id: string; facebook_pixel_id: string; whatsapp_number: string; whatsapp_message: string; formspree_url?: string; notification_email?: string };
  footer: { phone: string; phone_url: string; address_line1: string; address_line2: string; instagram_url: string; whatsapp_url: string; copyright: string; hashtag: string };
  seo: { title: string; description: string; keywords: string };
  tropa_config: { heading: string; heading_em: string; subheading: string; paragraphs: string[]; image_url: string; cta_label: string; instagram_url: string; instagram_label: string; show_mobile?: boolean };
  languages: { default: string; enabled: string[]; translations: Record<string, { name: string; flag: string }> };
  settings?: { notifications: boolean; darkMode: boolean; language: string; maintenanceMode: boolean };
  [key: string]: any;
}

export const FALLBACK_CONTENT: SiteContent = {
  hero: {
    title_lines: ["Vamos", "Invadir", "Seu Evento"],
    subtitle: "A hora da gravata\nnunca mais será\na mesma /",
    location: "São Paulo\nCapital",
    cta_label: "EXECUTAR O PLANO",
    cta_url: "https://api.whatsapp.com/send?phone=5511985111012",
    images: [],
    video_url: "",
    show_video_mobile: true,
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
  coupons: {
    heading: "Cupons",
    heading_em: "Especiais",
    items: [
      {
        title: "Primeira Invasão",
        code: "GRAVATA10",
        discount: "10% OFF",
        description: "Válido para o seu primeiro contrato de animação teatral.",
        link: "/questionarioevento"
      },
      {
        title: "Combo Casamento",
        code: "VIVAOSNOIVOS",
        discount: "Bônus Plataforma 360",
        description: "Feche o pacote completo e ganhe 1 hora extra de plataforma 360.",
        link: "/questionarioevento"
      },
      {
        title: "Aniversário La Gravata",
        code: "FESTA20",
        discount: "R$ 200 de desconto",
        description: "Desconto especial para eventos realizados de segunda a quinta.",
        link: "/questionarioevento"
      }
    ]
  },
  instagram_config: {
    handle: "lagravatadepapel",
    profile_url: "https://www.instagram.com/lagravatadepapel",
    title: "Siga no Instagram",
    subtitle: "Os bastidores das nossas invasões.",
    mode: "manual",
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
  tropa_config: {
    heading: "A Tropa Invadiu",
    heading_em: "Seu Casamento",
    subheading: "A hora da gravata nunca mais será a mesma.",
    paragraphs: [
      "A hora da gravata é uma das tradições mais antigas dos casamentos brasileiros — surgiu com os imigrantes italianos e espanhóis no início do século XX e virou costume até hoje. O ritual é simples: logo após a sobremesa, padrinhos e amigos saem de mesa em mesa com a gravata do noivo, pedem contribuições para a lua de mel e quem colabora leva um pedacinho como lembrança.",
      "Bonito no papel. Na prática? Sem uma tropa treinada, vira uma bandeja de isopor, uma piada sem graça e o noivo travado sem saber o que fazer.",
      "Foi aí que a Tropa da Gravata entrou em operação.",
      "Inspirada nos personagens do BOPE imortalizados no filme Tropa de Elite, nossa equipe invade o salão fardada, disciplinada e com energia de missão cumprida — transformando a hora da gravata em um espetáculo à parte. Os agentes dominam o ambiente, envolvem os convidados com humor afiado e criam um momento que todo mundo vai lembrar — inclusive aquele tio que estava tentando escapar.",
      "O plano é simples: entrar, surpreender e sair com a missão cumprida."
    ],
    image_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/message-attachments/fa1e2554-75eb-47f0-ba93-607583130d73/Instagram_files/561755360_18109376935599626_8280922716105922460_n.jpg",
    cta_label: "Contrate Agora",
    instagram_url: "https://www.instagram.com/tropadagravata/",
    instagram_label: "Ver no Instagram"
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

  const fetchContent = useCallback(async (isMounted: boolean = true) => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value, draft_value");
      
      if (error) {
        console.error("Supabase error fetching site content:", error);
        // Silent error for end users unless it's a critical fetch
        return;
      }

      if (data && isMounted) {
        const merged: SiteContent = { ...FALLBACK_CONTENT };
        for (const row of data) {
          const v = useDraft && row.draft_value ? row.draft_value : row.value;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            merged[row.key] = { ...(FALLBACK_CONTENT[row.key] ?? {}), ...v };
          } else if (v !== null && v !== undefined) {
            merged[row.key] = v;
          }
        }
        setContent(merged);
      }
    } catch (err) {
      console.error("Critical error fetching site content:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [useDraft]);

  useEffect(() => {
    let isMounted = true;
    fetchContent(isMounted);

    // Configurar Realtime Subscription para atualizações automáticas
    const channel = supabase
      .channel('site_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content'
        },
        () => {
          if (isMounted) fetchContent(isMounted);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchContent]);

  const updateSection = async (key: string, newValue: any, isDraft = false) => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .upsert({ 
          key, 
          value: newValue, 
          draft_value: newValue, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'key' })
        .select();

      if (error) {
        console.error(`[useSiteContent] Supabase error for ${key}:`, error);
        toast.error(`Erro no Supabase: ${error.message}`);
        throw error;
      }
      
      
      
      setContent(prev => ({
        ...prev,
        [key]: newValue
      }));

      return true;
    } catch (err: any) {
      console.error(`[useSiteContent] Catch block for ${key}:`, err);
      toast.error(`Erro crítico ao salvar: ${err.message || 'Verifique sua conexão'}`);
      throw err;
    }
  };

  return { content, loading, updateSection, refresh: fetchContent };
}