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
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [useDraft]);

  const updateSection = async (key: string, newValue: any, isDraft = false) => {
    try {
      console.log(`[useSiteContent] Starting update for section: ${key}`, { newValue });
      
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
      
      console.log(`[useSiteContent] Update successful for ${key}:`, data);
      
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