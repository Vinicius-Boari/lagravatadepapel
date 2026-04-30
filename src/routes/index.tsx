import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const WHATSAPP_DEFAULT =
  "https://api.whatsapp.com/send?phone=5511985111012&text=Olá,%20visitei%20o%20site%20de%20vocês%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20La%20Gravata%20de%20Papel.";
const WHATSAPP_PLAN =
  "https://api.whatsapp.com/send?phone=5511985111012&text=Olá,%20Gostaria%20de%20%22executar%20um%20plano%22%20com%20vocês.";

const services = [
  { img: "/images/hero_invasion.png", title: "Invasão Temática", desc: "Personagens da série invadem sua festa" },
  { img: "/images/service_tequileiro.png", title: "Tequileiros", desc: "Animação premium na pista de dança" },
  { img: "/images/service_robo.png", title: "Robô de LED", desc: "Show de luzes futurístico" },
  { img: "/images/service_co2.png", title: "Bazuca CO2", desc: "Efeitos especiais de fumaça" },
];

const places = [
  { img: "/images/hero_invasion.png", title: "Hora da Gravata", tag: "Invasão Temática" },
  { img: "/images/hero_party.png", title: "Animação da Balada", tag: "Pista de Dança" },
  { img: "/images/service_foto360.png", title: "Plataforma 360°", tag: "Vídeo Interativo" },
];

// Video showcase blocks — replace `src` with real .mp4 URLs (or use `poster` for thumbnails)
const videos: { title: string; tag: string; src?: string; poster?: string; tall?: boolean }[] = [
  { title: "Invasão ao Vivo", tag: "Reels Instagram", poster: "/images/hero_invasion.png" },
  { title: "Tequileiros em Ação", tag: "Pista de Dança", poster: "/images/service_tequileiro.png", tall: true },
  { title: "Robô de LED", tag: "Show de Luzes", poster: "/images/service_robo.png", tall: true },
  { title: "Bazuca CO2", tag: "Efeito Especial", poster: "/images/service_co2.png" },
];

const tickerItems = [
  "LA GRAVATA DE PAPEL", "OS ORIGINAIS", "ANIMAÇÃO TEATRAL", "CASAMENTOS",
  "TEQUILEIROS", "ROBÔ DE LED", "BAZUCA CO2", "PLATAFORMA 360°",
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const heroImgsRef = useRef<HTMLDivElement>(null);

  // Add body class
  useEffect(() => {
    document.body.classList.add("lg-body");
    return () => document.body.classList.remove("lg-body");
  }, []);

  // Cursor + parallax + header hide
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx - 4 + "px"; dot.style.top = my - 4 + "px"; }
    };
    const animR = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      if (ring) { ring.style.left = rx - 20 + "px"; ring.style.top = ry - 20 + "px"; }
      raf = requestAnimationFrame(animR);
    };
    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animR);

    const hoverEls = document.querySelectorAll("a,button,.service-card,.place-card");
    const enter = () => ring?.classList.add("hover");
    const leave = () => ring?.classList.remove("hover");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });

    let ls = 0;
    const onScroll = () => {
      const c = window.scrollY;
      const hdr = headerRef.current;
      if (hdr) {
        hdr.style.transform = c > ls && c > 100 ? "translateY(-100%)" : "translateY(0)";
      }
      ls = c;
      if (c < window.innerHeight * 1.5 && heroImgsRef.current) {
        const imgs = heroImgsRef.current.querySelectorAll<HTMLDivElement>(".hero-img");
        if (imgs[0]) imgs[0].style.transform = `rotate(-6deg) translateY(${c * 0.08}px)`;
        if (imgs[1]) imgs[1].style.transform = `translate(-50%,-50%) rotate(2deg) translateY(${c * 0.04}px)`;
        if (imgs[2]) imgs[2].style.transform = `rotate(5deg) translateY(${c * 0.06}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 100);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      obs.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />

      <header className="lg-header" ref={headerRef}>
        <div className="logo">
          <div>
            <div className="logo-text">La Gravata<br />de Papel</div>
          </div>
          <span className="logo-tagline">Os Originais</span>
        </div>
        <div className="nav-right">
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <div className="menu-lines"><span /><span /></div>
            <span>MENU</span>
          </button>
        </div>
      </header>

      <div className={`fullscreen-menu${menuOpen ? " active" : ""}`}>
        <button className="menu-close" onClick={closeMenu} aria-label="Fechar menu">
          <span>Fechar</span>
          <span className="menu-close-x">✕</span>
        </button>
        <span className="menu-label">Navegação</span>
        <nav className="menu-nav">
          <a href="#hero" onClick={closeMenu}>Home</a>
          <a href="#servicos" onClick={closeMenu}>Serviços</a>
          <a href="#invasoes" onClick={closeMenu}>Invasões</a>
          <a href="#sobre" onClick={closeMenu}>Sobre</a>
          <a href="#contato" onClick={closeMenu}>Contato</a>
        </nav>
      </div>

      <section className="hero" id="hero">
        <div className="hero-images" ref={heroImgsRef}>
          <div className="hero-img hero-img-1">
            <img src="/images/hero_invasion.png" alt="Invasão La Gravata de Papel" />
          </div>
          <div className="hero-img hero-img-2">
            <img src="/images/hero_venue.png" alt="Evento Espetacular" />
          </div>
          <div className="hero-img hero-img-3">
            <img src="/images/hero_party.png" alt="Festa Premium" />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Vamos<br />Invadir<br /><em>Seu Evento</em></h1>
          <p className="hero-subtitle">A hora da gravata<br />nunca mais será<br />a mesma /</p>
        </div>

        <div className="hero-location">São Paulo<br />Capital</div>

        <div className="hero-cta">
          <a href={WHATSAPP_DEFAULT} target="_blank" rel="noopener noreferrer">
            <span>EXECUTAR O PLANO</span>
            <span className="cta-dot" />
          </a>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i}>{t} •</span>
          ))}
        </div>
      </div>

      <section className="services-section" id="servicos">
        <div className="section-header reveal">
          <h2>Nossos<br /><span>Serviços</span></h2>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card reveal" key={s.title}>
              <img src={s.img} alt={s.title} />
              <div className="service-card-overlay">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dark-section">
        <div className="dark-content reveal">
          <h2>O Plano É<br /><em>Surpreender</em></h2>
          <p>
            Vamos invadir seu casamento com personagens caracterizados como os da série "La Casa de Papel",
            munidos com efeitos especiais de áudio e vídeo, além de surpresas e atuação teatral que ficará
            na memória dos noivos e de cada convidado. Nós somos La Gravata de Papel — os originais.
          </p>
          <a href={WHATSAPP_PLAN} target="_blank" className="btn-outline" rel="noopener noreferrer">
            <span>Contrate Agora</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <section className="places-section" id="invasoes">
        <div className="places-header reveal">
          <h2>Nossas<br />Invasões</h2>
          <a href="https://www.instagram.com/lagravatadepapel" target="_blank" rel="noopener noreferrer">
            Ver no Instagram →
          </a>
        </div>
        <div className="places-grid">
          {places.map((p) => (
            <div className="place-card reveal" key={p.title}>
              <img src={p.img} alt={p.title} />
              <div className="place-card-overlay">
                <h3>{p.title}</h3>
                <span>{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section" id="sobre">
        <div className="about-image">
          <img src="/images/hero_venue.png" alt="Sobre La Gravata de Papel" />
        </div>
        <div className="about-text">
          <h2 className="reveal">La Gravata<br />de <em>Papel</em></h2>
          <p className="reveal">
            Somos especialistas em transformar a hora da gravata em um espetáculo cinematográfico. Com
            personagens caracterizados, efeitos especiais de áudio e vídeo, e uma atuação teatral planejada,
            criamos momentos que ficam eternizados na memória dos noivos e convidados.
          </p>
          <p className="reveal">
            A Toronto Produções, empresa por trás da La Gravata de Papel, está no ramo de eventos há mais
            de 20 anos. Além da invasão temática, oferecemos tequileiros, sapatinho da noiva, robô de LED,
            bazuca de fumaça CO2, totem fotográfico e plataforma 360°.
          </p>
          <a href={WHATSAPP_DEFAULT} target="_blank" className="btn-outline reveal" rel="noopener noreferrer">
            <span>Fale Conosco</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <footer className="lg-footer" id="contato">
        <div className="footer-top">
          <div className="footer-logo">La Gravata<br />de Papel</div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Navegação</h4>
              <a href="#hero">Home</a>
              <a href="#servicos">Serviços</a>
              <a href="#invasoes">Invasões</a>
              <a href="#sobre">Sobre</a>
            </div>
            <div className="footer-col">
              <h4>Redes Sociais</h4>
              <a href="https://www.instagram.com/lagravatadepapel" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={WHATSAPP_DEFAULT} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div className="footer-col">
              <h4>Contato</h4>
              <a href="https://api.whatsapp.com/send?phone=5511985111012" target="_blank" rel="noopener noreferrer">(11) 98511-1012</a>
              <a href="#">Rua Mesquita, 384</a>
              <a href="#">Vila Deodoro, SP</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 La Gravata de Papel — Nome registrado no INPI. Todos os direitos reservados.</span>
          <span>#LAGRAVATADEPAPEL</span>
        </div>
      </footer>

      <a className="whatsapp-float" href={WHATSAPP_DEFAULT} target="_blank" rel="noopener noreferrer" aria-label="Fale pelo WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </>
  );
}
