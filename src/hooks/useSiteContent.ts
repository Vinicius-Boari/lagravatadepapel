import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteContent = Record<string, any>;

const FALLBACK: SiteContent = {
  hero: {
    title_lines: ["Vamos", "Invadir", "Seu Evento"],
    subtitle: "A hora da gravata\nnunca mais será\na mesma /",
    location: "São Paulo\nCapital",
    cta_label: "EXECUTAR O PLANO",
    cta_url:
      "https://api.whatsapp.com/send?phone=5511985111012&text=Olá,%20visitei%20o%20site%20de%20vocês%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20La%20Gravata%20de%20Papel.",
    images: [
      "/images/hero_invasion.png",
      "/images/hero_venue.png",
      "/images/hero_party.png",
    ],
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
    subtitle: "Os bastidores das nossas invasões — atualizados em tempo real.",
    mode: "manual",
  },
  footer: {
    phone: "", phone_url: "#", address_line1: "", address_line2: "",
    instagram_url: "#", whatsapp_url: "#",
    copyright: "© La Gravata de Papel", hashtag: "#LAGRAVATADEPAPEL",
  },
};

/**
 * Loads the public site content. If `useDraft` is true, prefers `draft_value`
 * over `value` (for in-panel preview by admins).
 */
export function useSiteContent(useDraft = false) {
  const [content, setContent] = useState<SiteContent>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value, draft_value");
      if (!mounted) return;
      if (!error && data) {
        const merged: SiteContent = { ...FALLBACK };
        for (const row of data) {
          const v = useDraft && row.draft_value ? row.draft_value : row.value;
          merged[row.key] = { ...(FALLBACK[row.key] ?? {}), ...(v as object) };
        }
        setContent(merged);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [useDraft]);

  return { content, loading };
}
