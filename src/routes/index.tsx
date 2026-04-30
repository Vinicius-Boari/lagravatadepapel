import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildWhatsAppUrl, parseEmbedUrl } from "@/lib/site-helpers";
import { DEFAULTS } from "@/lib/site-content-defaults";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: content } = useSiteContent();
  const c = content ?? DEFAULTS;

  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const heroImgsRef = useRef<HTMLDivElement>(null);

  const waDefault = buildWhatsAppUrl(c.whatsapp.phone, c.whatsapp.default_message);
  const waPlan = buildWhatsAppUrl(c.whatsapp.phone, c.whatsapp.plan_message);

  // Add body class
  useEffect(() => {
    document.body.classList.add("lg-body");
    return () => document.body.classList.remove("lg-body");
  }, []);

  // Cursor + parallax + header hide + reveal + tilt + scroll-3d.
  // Re-runs when content changes so observers catch newly rendered nodes.
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
      const cy = window.scrollY;
      const hdr = headerRef.current;
      if (hdr) {
        hdr.style.transform = cy > ls && cy > 100 ? "translateY(-100%)" : "translateY(0)";
      }
      ls = cy;
      if (cy < window.innerHeight * 1.5 && heroImgsRef.current) {
        const imgs = heroImgsRef.current.querySelectorAll<HTMLDivElement>(".hero-img");
        if (imgs[0]) imgs[0].style.transform = `rotate(-6deg) translateY(${cy * 0.08}px)`;
        if (imgs[1]) imgs[1].style.transform = `translate(-50%,-50%) rotate(2deg) translateY(${cy * 0.04}px)`;
        if (imgs[2]) imgs[2].style.transform = `rotate(5deg) translateY(${cy * 0.06}px)`;
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

    const tiltEls = document.querySelectorAll<HTMLElement>(".tilt-3d");
    const tiltHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    tiltEls.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--tx", `${x * 14}deg`);
        el.style.setProperty("--ty", `${-y * 14}deg`);
      };
      const leave = () => {
        el.style.setProperty("--tx", `0deg`);
        el.style.setProperty("--ty", `0deg`);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      tiltHandlers.push({ el, move, leave });
    });

    const scrollEls = document.querySelectorAll<HTMLElement>(".scroll-3d");
    const onScroll3d = () => {
      scrollEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        el.style.setProperty("--sx", `${clamped * 8}deg`);
        el.style.setProperty("--sy", `${clamped * -10}deg`);
        el.style.setProperty("--sz", `${-Math.abs(clamped) * 60}px`);
      });
    };
    window.addEventListener("scroll", onScroll3d, { passive: true });
    onScroll3d();

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll3d);
      cancelAnimationFrame(raf);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
      obs.disconnect();
    };
  }, [content]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />

      <header className="lg-header" ref={headerRef}>
        <div className="logo">
          <div>
            <div className="logo-text">{c.logo.line1}<br />{c.logo.line2}</div>
          </div>
          <span className="logo-tagline">{c.logo.tagline}</span>
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
          <a href="#videos" onClick={closeMenu}>Vídeos</a>
          <a href="#invasoes" onClick={closeMenu}>Invasões</a>
          <a href="#sobre" onClick={closeMenu}>Sobre</a>
          <a href="#contato" onClick={closeMenu}>Contato</a>
        </nav>
      </div>

      <section className="hero" id="hero">
        <div className="hero-images" ref={heroImgsRef}>
          <div className="hero-img hero-img-1">
            <img src={c.hero.image1} alt="Invasão La Gravata de Papel" />
          </div>
          <div className="hero-img hero-img-2">
            <img src={c.hero.image2} alt="Evento Espetacular" />
          </div>
          <div className="hero-img hero-img-3">
            <img src={c.hero.image3} alt="Festa Premium" />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            {c.hero.title_line1}<br />{c.hero.title_line2}<br /><em>{c.hero.title_line3}</em>
          </h1>
          <p className="hero-subtitle">
            {c.hero.subtitle.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        </div>

        <div className="hero-location">
          {c.hero.location.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>

        <div className="hero-cta">
          <a href={waDefault} target="_blank" rel="noopener noreferrer">
            <span>{c.hero.cta_label}</span>
            <span className="cta-dot" />
          </a>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          {[...c.tickers.items, ...c.tickers.items].map((t, i) => (
            <span key={i}>{t} •</span>
          ))}
        </div>
      </div>

      <section className="services-section" id="servicos">
        <div className="section-header reveal">
          <h2>{c.services.heading_line1}<br /><span>{c.services.heading_line2}</span></h2>
        </div>
        <div className="services-grid scene-3d">
          {c.services.items.map((s, idx) => (
            <div className="service-card tilt-3d scroll-3d reveal" key={idx}>
              <img src={s.img} alt={s.title} />
              <div className="service-card-overlay">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="video-section" id="videos">
        <div className="video-section-header reveal">
          <h2>{c.videos.heading.includes(" ") ? (
            <>
              {c.videos.heading.split(" ").slice(0, -1).join(" ")} <em><span>{c.videos.heading.split(" ").slice(-1)[0]}</span></em>
            </>
          ) : <em><span>{c.videos.heading}</span></em>}</h2>
        </div>
        <div className="video-grid scene-3d">
          {c.videos.items.map((v, idx) => {
            const embed = parseEmbedUrl(v.url);
            return (
              <div className={`video-card tilt-3d scroll-3d${v.tall ? " tall" : ""}`} key={idx}>
                {v.src ? (
                  <video src={v.src} poster={v.poster} autoPlay muted loop playsInline />
                ) : embed ? (
                  <iframe
                    src={embed.embed}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                    title={v.title}
                  />
                ) : (
                  <>
                    {v.poster && <img src={v.poster} alt={v.title} />}
                    <div className="video-card-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      <span>Vídeo em breve</span>
                      <em>Adicione no painel</em>
                    </div>
                  </>
                )}
                <div className="video-card-overlay">
                  <h3>{v.title}</h3>
                  <span>{v.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dark-section">
        <div className="dark-content reveal">
          <h2>{renderHeading(c.dark_cta.heading)}</h2>
          <p>{c.dark_cta.text}</p>
          <a href={waPlan} target="_blank" className="btn-outline" rel="noopener noreferrer">
            <span>{c.dark_cta.button_label}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <section className="places-section" id="invasoes">
        <div className="places-header reveal">
          <h2>{c.invasions.heading_line1}<br />{c.invasions.heading_line2}</h2>
          <a href={c.invasions.instagram_url} target="_blank" rel="noopener noreferrer">
            {c.invasions.instagram_label}
          </a>
        </div>
        <div className="places-grid scene-3d">
          {c.invasions.items.map((p, idx) => (
            <div className="place-card tilt-3d scroll-3d reveal" key={idx}>
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
        <div className="about-image scene-3d">
          <div className="scroll-3d tilt-3d">
            <img src={c.about.image} alt="Sobre La Gravata de Papel" />
          </div>
        </div>
        <div className="about-text">
          <h2 className="reveal">{renderHeading(c.about.heading)}</h2>
          <p className="reveal">{c.about.paragraph1}</p>
          <p className="reveal">{c.about.paragraph2}</p>
          <a href={waDefault} target="_blank" className="btn-outline reveal" rel="noopener noreferrer">
            <span>{c.about.button_label}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <footer className="lg-footer" id="contato">
        <div className="footer-top">
          <div className="footer-logo">{c.logo.line1}<br />{c.logo.line2}</div>
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
              <a href={c.footer.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={waDefault} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div className="footer-col">
              <h4>Contato</h4>
              <a href={waDefault} target="_blank" rel="noopener noreferrer">{c.whatsapp.phone_display}</a>
              <span>{c.footer.address_line1}</span>
              <span>{c.footer.address_line2}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            {c.footer.copyright}
            {" · "}
            <Link to="/login" className="footer-painel-link">Painel</Link>
          </span>
          <span>{c.footer.hashtag}</span>
        </div>
      </footer>

      <a className="whatsapp-float" href={waDefault} target="_blank" rel="noopener noreferrer" aria-label="Fale pelo WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </>
  );
}

/** Render a heading with the last word emphasized. */
function renderHeading(heading: string) {
  const words = heading.trim().split(" ");
  if (words.length < 2) return <em>{heading}</em>;
  return (
    <>
      {words.slice(0, -1).join(" ")}<br /><em>{words.slice(-1)[0]}</em>
    </>
  );
}
