// Default content shown if site_content row is missing.
// MUST mirror the SQL seed in supabase/migrations.

export const DEFAULTS = {
  seo: {
    title: "La Gravata de Papel — Vamos Invadir Seu Evento",
    description: "La Gravata de Papel — Vamos invadir seu casamento com personagens da série La Casa de Papel. Animação teatral, tequileiros, robô de LED, bazuca CO2 e muito mais.",
    og_title: "La Gravata de Papel — Vamos Invadir Seu Evento",
    og_description: "Animação teatral inspirada em La Casa de Papel para casamentos e festas em São Paulo.",
    og_image: "",
  },
  hero: {
    title_line1: "Vamos",
    title_line2: "Invadir",
    title_line3: "Seu Evento",
    subtitle: "A hora da gravata\nnunca mais será\na mesma /",
    location: "São Paulo\nCapital",
    cta_label: "EXECUTAR O PLANO",
    image1: "/images/hero_invasion.png",
    image2: "/images/hero_venue.png",
    image3: "/images/hero_party.png",
  },
  logo: {
    line1: "La Gravata",
    line2: "de Papel",
    tagline: "Os Originais",
  },
  tickers: {
    items: [
      "LA GRAVATA DE PAPEL", "OS ORIGINAIS", "ANIMAÇÃO TEATRAL", "CASAMENTOS",
      "TEQUILEIROS", "ROBÔ DE LED", "BAZUCA CO2", "PLATAFORMA 360°",
    ] as string[],
  },
  services: {
    heading_line1: "Nossos",
    heading_line2: "Serviços",
    items: [
      { img: "/images/hero_invasion.png", title: "Invasão Temática", desc: "Personagens da série invadem sua festa" },
      { img: "/images/service_tequileiro.png", title: "Tequileiros", desc: "Animação premium na pista de dança" },
      { img: "/images/service_robo.png", title: "Robô de LED", desc: "Show de luzes futurístico" },
      { img: "/images/service_co2.png", title: "Bazuca CO2", desc: "Efeitos especiais de fumaça" },
    ] as Array<{ img: string; title: string; desc: string }>,
  },
  videos: {
    heading: "Em Movimento",
    items: [
      { title: "Invasão ao Vivo", tag: "Reels Instagram", poster: "/images/hero_invasion.png", src: "", url: "", tall: false },
      { title: "Tequileiros em Ação", tag: "Pista de Dança", poster: "/images/service_tequileiro.png", src: "", url: "", tall: true },
      { title: "Robô de LED", tag: "Show de Luzes", poster: "/images/service_robo.png", src: "", url: "", tall: true },
      { title: "Bazuca CO2", tag: "Efeito Especial", poster: "/images/service_co2.png", src: "", url: "", tall: false },
    ] as Array<{ title: string; tag: string; poster: string; src: string; url: string; tall: boolean }>,
  },
  dark_cta: {
    heading: "O Plano É Surpreender",
    text: 'Vamos invadir seu casamento com personagens caracterizados como os da série "La Casa de Papel", munidos com efeitos especiais de áudio e vídeo, além de surpresas e atuação teatral que ficará na memória dos noivos e de cada convidado. Nós somos La Gravata de Papel — os originais.',
    button_label: "Contrate Agora",
  },
  invasions: {
    heading_line1: "Nossas",
    heading_line2: "Invasões",
    instagram_url: "https://www.instagram.com/lagravatadepapel",
    instagram_label: "Ver no Instagram →",
    items: [
      { img: "/images/hero_invasion.png", title: "Hora da Gravata", tag: "Invasão Temática" },
      { img: "/images/hero_party.png", title: "Animação da Balada", tag: "Pista de Dança" },
      { img: "/images/service_foto360.png", title: "Plataforma 360°", tag: "Vídeo Interativo" },
    ] as Array<{ img: string; title: string; tag: string }>,
  },
  about: {
    image: "/images/hero_venue.png",
    heading: "La Gravata de Papel",
    paragraph1: "Somos especialistas em transformar a hora da gravata em um espetáculo cinematográfico. Com personagens caracterizados, efeitos especiais de áudio e vídeo, e uma atuação teatral planejada, criamos momentos que ficam eternizados na memória dos noivos e convidados.",
    paragraph2: "A Toronto Produções, empresa por trás da La Gravata de Papel, está no ramo de eventos há mais de 20 anos. Além da invasão temática, oferecemos tequileiros, sapatinho da noiva, robô de LED, bazuca de fumaça CO2, totem fotográfico e plataforma 360°.",
    button_label: "Fale Conosco",
  },
  whatsapp: {
    phone: "5511985111012",
    phone_display: "(11) 98511-1012",
    default_message: "Olá, visitei o site de vocês e gostaria de saber mais sobre a La Gravata de Papel.",
    plan_message: 'Olá, Gostaria de "executar um plano" com vocês.',
  },
  footer: {
    address_line1: "Rua Mesquita, 384",
    address_line2: "Vila Deodoro, SP",
    instagram_url: "https://www.instagram.com/lagravatadepapel",
    copyright: "© 2026 La Gravata de Papel — Nome registrado no INPI. Todos os direitos reservados.",
    hashtag: "#LAGRAVATADEPAPEL",
  },
};

export type ContentKey = keyof typeof DEFAULTS;
export type Content = typeof DEFAULTS;

// Recommended media specs per slot (shown in admin).
export const MEDIA_SPECS = {
  hero_image: { width: 1920, height: 1080, maxKB: 600, formats: "JPG, WebP", note: "Imagens grandes do topo" },
  service_card: { width: 800, height: 1000, maxKB: 350, formats: "JPG, WebP", note: "Cards verticais" },
  invasion_card: { width: 800, height: 1000, maxKB: 350, formats: "JPG, WebP", note: "Cards verticais" },
  video_poster: { width: 1280, height: 720, maxKB: 400, formats: "JPG, WebP", note: "Thumbnail do vídeo" },
  video_file: { width: 1280, height: 720, maxKB: 15000, formats: "MP4 (H.264)", note: "Vídeo curto, < 30s recomendado" },
  about_image: { width: 1200, height: 1500, maxKB: 500, formats: "JPG, WebP", note: "Imagem da seção Sobre" },
  og_image: { width: 1200, height: 630, maxKB: 300, formats: "JPG, PNG", note: "Imagem que aparece quando compartilha o link" },
} as const;

export type MediaSpec = keyof typeof MEDIA_SPECS;
