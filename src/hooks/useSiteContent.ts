import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SiteContent = Record<string, any>;

export const FALLBACK_CONTENT: SiteContent = {
  hero: {
    title_lines: ["Vamos", "Invadir", "Seu Evento"],
    subtitle: "A hora da gravata\nnunca mais será\na mesma /",
    location: "São Paulo\nCapital",
    logo_line1: "La Gravata",
    logo_line2: "de Papel",
    logo_tagline: "Os Originais",
    cta_label: "EXECUTAR O PLANO",
    cta_url: "https://api.whatsapp.com/send?phone=5511985111012",
    image1: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png",
    image2: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png",
    image3: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.7844070081079361.png",
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
  services: { 
    heading: "Nossos", 
    heading_em: "Serviços", 
    items: [
      {
        title: "Invasão Temática",
        desc: "Personagens da série invadem sua festa",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png"
      },
      {
        title: "Tequileiros",
        desc: "Animação premium na pista de dança",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.05445258522774136.png"
      },
      {
        title: "Robô de LED",
        desc: "Show de luzes futurístico",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png"
      },
      {
        title: "Bazuca CO2",
        desc: "Efeitos especiais de fumaça",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.7844070081079361.png"
      }
    ] 
  },
  videos: { 
    heading: "Em Movimento", 
    items: [
      {
        title: "Invasão ao Vivo",
        tag: "Reels Instagram",
        src: "",
        poster: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png",
        tall: false
      },
      {
        title: "Tequileiros em Ação",
        tag: "Pista de Dança",
        src: "",
        poster: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.05445258522774136.png",
        tall: true
      },
      {
        title: "Robô de LED",
        tag: "Show de Luzes",
        src: "",
        poster: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png",
        tall: true
      },
      {
        title: "Bazuca CO2",
        tag: "Efeito Especial",
        src: "",
        poster: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.7844070081079361.png",
        tall: false
      }
    ] 
  },
  plan: { 
    heading: "O Plano É", 
    heading_em: "Surpreender", 
    text: "Vamos invadir seu casamento com personagens caracterizados como os da série 'La Casa de Papel', munidos com efeitos especiais de áudio e vídeo, além de surpresas e atuação teatral que ficará na memória dos noivos e de cada convidado. Nós somos La Gravata de Papel — os originais.", 
    cta_label: "Contrate Agora", 
    cta_url: "/questionarioevento" 
  },
  places: { 
    heading: "Nossas", 
    heading2: "Invasões", 
    instagram_url: "https://www.instagram.com/lagravatadepapel", 
    items: [
      {
        title: "Hora da Gravata",
        tag: "Invasão Temática",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png"
      },
      {
        title: "Animação da Balada",
        tag: "Pista de Dança",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.7844070081079361.png"
      },
      {
        title: "Plataforma 360°",
        tag: "Vídeo Interativo",
        img: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png"
      }
    ] 
  },
  about: { 
    heading: "La Gravata", 
    heading_em: "de Papel", 
    image: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.05445258522774136.png", 
    paragraphs: [
      "Somos uma empresa especializada em transformar momentos comuns em experiências inesquecíveis. Inspirados em grandes produções e no universo cinematográfico, levamos entretenimento interativo para eventos, criando apresentações envolventes que surpreendem convidados e tornam cada celebração única.",
      "Nosso principal objetivo é reinventar a tradicional “hora da gravata”, trazendo uma abordagem criativa, dinâmica e cheia de energia. Com personagens caracterizados, efeitos especiais e uma atuação imersiva, proporcionamos uma experiênci divertida, interativa e memorável para noivos, convidados e todos os presentes.",
      "Se você busca inovação, diversão e um momento realmente marcante, nós somos o plano perfeito para o seu evento."
    ], 
    cta_label: "Fale Conosco", 
    cta_url: "https://api.whatsapp.com/send?phone=5511985111012" 
  },
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
    access_token: "",
    app_id: "",
    app_secret: "",
    items: [
      { id: "1", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png", permalink: "https://www.instagram.com/lagravatadepapel" },
      { id: "2", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.05445258522774136.png", permalink: "https://www.instagram.com/lagravatadepapel" },
      { id: "3", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png", permalink: "https://www.instagram.com/lagravatadepapel" },
      { id: "4", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.7844070081079361.png", permalink: "https://www.instagram.com/lagravatadepapel" },
      { id: "5", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.5186595562725807.png", permalink: "https://www.instagram.com/lagravatadepapel" },
      { id: "6", type: "IMAGE", media_url: "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/media/site_content/0.17764126909249536.png", permalink: "https://www.instagram.com/lagravatadepapel" }
    ]
  },
  integrations: {
    google_analytics_id: "",
    google_tag_manager_id: "",
    facebook_pixel_id: "",
    whatsapp_number: "5511985111012",
    whatsapp_message: "Olá, gostaria de saber mais sobre a La Gravata de Papel.",
  },
  footer: {
    phone: "5511985111012", 
    phone_url: "https://api.whatsapp.com/send?phone=5511985111012", 
    address_line1: "São Paulo, SP", 
    address_line2: "",
    instagram_url: "https://www.instagram.com/lagravatadepapel", 
    whatsapp_url: "https://api.whatsapp.com/send?phone=5511985111012",
    copyright: "© La Gravata de Papel", hashtag: "#LAGRAVATADEPAPEL",
  },
  seo: {
    title: "La Gravata de Papel — Vamos Invadir Seu Evento",
    description: "La Gravata de Papel — Vamos invadir seu casamento com personagens da série La Casa de Papel. Animação teatral, tequileiros, robô de LED, bazuca CO2 e muito mais.",
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
          if (v && typeof v === 'object') {
            merged[row.key] = { ...(FALLBACK_CONTENT[row.key] || {}), ...v };
          }
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

    // Configurar Realtime Subscription para atualizações automáticas com tratamento de erro
    let channel: any;
    
    try {
      channel = supabase
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
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime channel error - falling back to manual refresh');
          }
        });
    } catch (err) {
      console.error('Error setting up realtime channel:', err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
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