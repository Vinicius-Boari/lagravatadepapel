import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MessageCircle, Instagram, Facebook, Mail, Video as TikTokIcon, Ticket } from "lucide-react";
import type { SiteContent } from "@/hooks/useSiteContent";
import InstagramCarousel3D from "@/components/InstagramCarousel3D";

const tickerItems = [
  "LA GRAVATA DE PAPEL", "OS ORIGINAIS", "ANIMAÇÃO TEATRAL", "CASAMENTOS",
  "TEQUILEIROS", "ROBÔ DE LED", "BAZUCA CO2", "PLATAFORMA 360°",
];

function ImgWithFallback({ src, fallback, alt, ...props }: { src?: string; fallback: string; alt?: string; [key: string]: any }) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  
  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
}

export function SiteSections({ content, onMenuClick }: { content: SiteContent; onMenuClick?: () => void }) {
  const headerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroImgsRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.classList.add("lg-body");
    return () => {
      document.body.classList.remove("lg-body");
    };
  }, []);

  const initEffects = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mx = 0, my = 0;
    let trailX = 0, trailY = 0;
    const points: { x: number; y: number }[] = [];
    const maxPoints = 30;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      trailX += (mx - trailX) * 0.15;
      trailY += (my - trailY) * 0.15;

      points.push({ x: trailX, y: trailY });
      if (points.length > maxPoints) points.shift();

      if (points.length > 1) {
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          
          const progress = i / points.length;
          const opacity = progress * 0.5;
          const width = progress * 2.5;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(192, 57, 43, ${opacity})`;
          ctx.lineWidth = width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMove);
    resize();
    raf = requestAnimationFrame(animate);

    const onScroll = () => {
      const c = window.scrollY;
      if (c < window.innerHeight * 1.5 && heroImgsRef.current) {
        const imgs = heroImgsRef.current.querySelectorAll<HTMLDivElement>(".hero-img");
        if (imgs[0]) imgs[0].style.transform = `rotateY(-6deg) rotateZ(-6deg) translateY(${c * 0.1}px)`;
        if (imgs[1]) imgs[1].style.transform = `translate(-50%, -50%) rotateZ(2deg) translateY(${c * 0.05}px)`;
        if (imgs[2]) imgs[2].style.transform = `rotateY(6deg) rotateZ(5deg) translateY(${c * 0.08}px)`;
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll3d);
      cancelAnimationFrame(raf);
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    return initEffects();
  }, [initEffects]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { hero, services, videos, plan, places, about, coupons, tropa_config, instagram_config, footer } = content;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10000,
          mixBlendMode: "difference",
        }}
      />

      <header className="lg-header" style={{ mixBlendMode: 'normal' }} ref={headerRef}>
        <div 
          className="logo cursor-pointer" 
          style={{ color: '#000000', mixBlendMode: 'normal' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          role="button"
          aria-label="Voltar ao topo"
        >
          <div>
            <div className="logo-text">La Gravata<br />de Papel</div>
          </div>
          <span className="logo-tagline">Os Originais</span>
        </div>
        <div className="nav-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/questionarioevento" className="orcamento-header-btn">
            <span>ORÇAMENTO</span>
          </a>
          <button className="menu-btn" onClick={() => { setMenuOpen(true); onMenuClick?.(); }} aria-label="Abrir menu">
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
          <a href="/questionarioevento" onClick={closeMenu}>Orçamento</a>
          <a href="#videos" onClick={closeMenu}>Vídeos</a>
          <a href="#invasoes" onClick={closeMenu}>Invasões</a>
          <a href="#instagram" onClick={closeMenu}>Instagram</a>
          <a href="#sobre" onClick={closeMenu}>Sobre</a>
          <a href="#tropa-da-gravata" onClick={closeMenu}>Tropa da Gravata</a>
          <a href="#cupons" onClick={closeMenu}>Cupons</a>
          <a href="#contatos" onClick={closeMenu}>Contatos</a>
        </nav>
      </div>

      <section className="hero" id="hero">
        {hero.video_url && isDesktop && (
          <div className="hero-video-bg">
            <video src={hero.video_url} autoPlay muted loop playsInline preload="metadata" />
          </div>
        )}
        <div className="hero-images" ref={heroImgsRef}>
          <div className="hero-img hero-img-1">
            <ImgWithFallback src={hero.image1} fallback="/images/hero_invasion.png" alt="Hero 1" loading="lazy" />
          </div>
          <div className="hero-img hero-img-2">
            <ImgWithFallback src={hero.image2} fallback="/images/hero_venue.png" alt="Hero 2" loading="lazy" />
          </div>
          <div className="hero-img hero-img-3">
            <ImgWithFallback src={hero.image3} fallback="/images/hero_party.png" alt="Hero 3" loading="lazy" />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            {(hero.title_lines ?? []).map((line: string, i: number, arr: string[]) =>
              i === arr.length - 1 ? <em key={i}>{line}</em> : <span key={i}>{line}<br /></span>
            )}
          </h1>
          <p className="hero-subtitle">{hero.subtitle?.split("\n").map((l: string, i: number) => (<span key={i}>{l}<br /></span>))}</p>
        </div>

        <div className="hero-location">{hero.location?.split("\n").map((l: string, i: number) => (<span key={i}>{l}<br /></span>))}</div>

        <div className="hero-cta">
          <a href="/questionarioevento">
            <span>{hero.cta_label}</span>
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
          <h2>{services.heading}<br /><span>{services.heading_em}</span></h2>
        </div>
        <div className="services-grid scene-3d">
          {(services.items ?? []).map((s: any, i: number) => (
            <div className="service-card tilt-3d scroll-3d reveal" key={i}>
              <ImgWithFallback src={s.img} fallback="/images/hero_invasion.png" alt={s.title} loading="lazy" />
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
          <h2>{videos.heading}</h2>
        </div>
        <div className="video-grid scene-3d">
          {(videos.items ?? []).map((v: any, i: number) => (
            <div className={`video-card tilt-3d scroll-3d${v.tall ? " tall" : ""}`} key={i}>
              {v.src ? (
                <video src={v.src} poster={v.poster} autoPlay muted loop playsInline />
              ) : (
                <>
                  {v.poster && <img src={v.poster} alt={v.title} />}
                  <div className="video-card-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    <span>Vídeo em breve</span>
                  </div>
                </>
              )}
              <div className="video-card-overlay">
                <h3>{v.title}</h3>
                <span>{v.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dark-section">
        <div className="dark-content reveal">
          <h2>{plan.heading}<br /><em>{plan.heading_em}</em></h2>
          <p>{plan.text}</p>
          <a href="/questionarioevento" className="btn-outline">
            <span>{plan.cta_label}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <section className="places-section" id="invasoes">
        <div className="places-header reveal">
          <h2>{places.heading}<br />{places.heading2}</h2>
          <a href={places.instagram_url} target="_blank" rel="noopener noreferrer">
            Ver no Instagram →
          </a>
        </div>
        <div className="places-grid scene-3d">
          {(places.items ?? []).map((p: any, i: number) => (
            <div className="place-card tilt-3d scroll-3d reveal" key={i}>
              <ImgWithFallback src={p.img} fallback="/images/hero_invasion.png" alt={p.title} />
              <div className="place-card-overlay">
                <h3>{p.title}</h3>
                <span>{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <InstagramCarousel3D config={instagram_config ?? {}} />

      <section className="about-section" id="sobre">
        <div className="about-image scene-3d">
          <div className="scroll-3d tilt-3d">
            <ImgWithFallback src={about.image} fallback="/images/hero_invasion.png" alt="Sobre La Gravata de Papel" />
          </div>
        </div>
        <div className="about-text">
          <h2 className="reveal">{about.heading}<br /><em>{about.heading_em}</em></h2>
          {(about.paragraphs ?? []).map((p: string, i: number) => (
            <p className="reveal" key={i}>{p}</p>
          ))}
          <a href={about.cta_url || "https://api.whatsapp.com/send?phone=5511985111012"} target="_blank" rel="noopener noreferrer" className="btn-outline reveal">
            <span>{about.cta_label}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <section className="about-section" id="tropa-da-gravata" style={{ background: 'var(--color-black-lg)', color: 'var(--color-white-lg)' }}>
        <div className="about-text" style={{ background: 'transparent' }}>
          <h2 className="reveal">{(tropa_config?.heading || "A Tropa Invadiu")}<br /><em>{(tropa_config?.heading_em || "Seu Casamento")}</em></h2>
          <div className="space-y-6 text-left mb-10">
            <p className="text-red-500 font-bold italic mb-4">{(tropa_config?.subheading || "A hora da gravata nunca mais será a mesma.")}</p>
            {(tropa_config?.paragraphs || []).map((p: string, i: number) => (
              <p key={i} className="opacity-60">{p}</p>
            ))}
          </div>
          
          <div className="mt-8">
            <p className="text-white/80 mb-6 font-bold uppercase tracking-widest text-[10px]">Quer essa operação no seu evento?</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a href="/questionarioevento" className="btn-outline">
                <span>{(tropa_config?.cta_label || "Contrate Agora")}</span>
                <span>→</span>
              </a>
              <a 
                href={tropa_config?.instagram_url || "https://www.instagram.com/tropadagravata/"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-red-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold border-b border-red-500/30 pb-1"
              >
                <Instagram className="w-4 h-4" />
                <span>{(tropa_config?.instagram_label || "Ver no Instagram")} →</span>
              </a>
            </div>
          </div>
        </div>
        <div className="about-image scene-3d">
          <div className="scroll-3d tilt-3d">
            <img src={tropa_config?.image_url || "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/message-attachments/fa1e2554-75eb-47f0-ba93-607583130d73/Instagram_files/561755360_18109376935599626_8280922716105922460_n.jpg"} alt="Tropa da Gravata" loading="lazy" />
          </div>
        </div>
      </section>
      
      <section className="coupons-section" id="cupons">
        <div className="section-header reveal text-center">
          <h2 className="mx-auto">{coupons?.heading || "Cupons"} <em>{coupons?.heading_em || "Especiais"}</em></h2>
        </div>
        <div className="coupons-grid max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          {(coupons?.items || []).map((coupon: any, i: number) => (
            <div key={i} className="coupon-card reveal tilt-3d scroll-3d">
              <div className="coupon-content">
                <div className="coupon-header">
                  <Ticket className="w-8 h-8 text-red-600 mb-2" />
                  <span className="coupon-discount">{coupon.discount}</span>
                </div>
                <h3 className="coupon-title">{coupon.title}</h3>
                <p className="coupon-description">{coupon.description}</p>
                <div className="coupon-code-wrapper">
                  <span className="coupon-code">{coupon.code}</span>
                  <a href={coupon.link} className="coupon-btn">
                    RESGATAR
                  </a>
                </div>
              </div>
              <div className="coupon-border-left"></div>
              <div className="coupon-border-right"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12 reveal">
          <a href="/questionarioevento" className="btn-outline">
            <span>QUERO MEU CUPOM</span>
            <span>→</span>
          </a>
        </div>
      </section>

      <section className="contacts-section" id="contatos">
        <div className="section-header reveal text-center">
          <h2 className="mx-auto !text-red-600 font-bold">Contatos</h2>
        </div>
        
        <div className="contacts-grid scene-3d">
          {[
            { 
              platform: "WhatsApp", 
              info: "(11) 98511-1012", 
              link: "https://api.whatsapp.com/send?phone=5511985111012",
              icon: <MessageCircle className="w-6 h-6" />
            },
            { 
              platform: "Instagram", 
              info: "@lagravatadepapel", 
              link: "https://www.instagram.com/lagravatadepapel/",
              icon: <Instagram className="w-6 h-6" />
            },
            { 
              platform: "Facebook", 
              info: "La Gravata de Papel", 
              link: "https://www.facebook.com/lagravatadepapel",
              icon: <Facebook className="w-6 h-6" />
            },
            { 
              platform: "TikTok", 
              info: "@lagravatadepapel", 
              link: "https://www.tiktok.com/@lagravatadepapel",
              icon: <TikTokIcon className="w-6 h-6" />
            },
            { 
              platform: "E-mail", 
              info: "torontosac@gmail.com", 
              link: "mailto:torontosac@gmail.com",
              icon: <Mail className="w-6 h-6" />
            }
          ].map((contact, i) => (
            <a 
              key={i}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card tilt-3d scroll-3d reveal group"
            >
              <div className="contact-icon-wrapper group-hover:scale-110 transition-transform duration-300">
                {contact.icon}
              </div>
              <div className="contact-info">
                <span className="contact-platform">{contact.platform}</span>
                <span className="contact-handle">{contact.info}</span>
              </div>
              <div className="contact-arrow">
                <span>→</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="lg-footer">
        <div className="footer-top">
          <div className="footer-logo">La Gravata<br />de Papel</div>
          <div className="footer-links">
          <div className="footer-col">
            <h4>Navegação</h4>
            <a href="#hero">Home</a>
            <a href="#servicos">Serviços</a>
            <a href="/questionarioevento">Questionário</a>
            <a href="#invasoes">Invasões</a>
            <a href="#sobre">Sobre</a>
            <a href="#tropa-da-gravata">Tropa da Gravata</a>
            <a href="#cupons">Cupons</a>
            <a href="#contatos">Contatos</a>
          </div>
            <div className="footer-col">
              <h4>Redes Sociais</h4>
              <a href="https://www.instagram.com/lagravatadepapel/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/lagravatadepapel" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.tiktok.com/@lagravatadepapel" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://api.whatsapp.com/send?phone=5511985111012" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div className="footer-col">
              <h4>Contato</h4>
              <a href="https://api.whatsapp.com/send?phone=5511985111012" target="_blank" rel="noopener noreferrer">(11) 98511-1012</a>
              <a href="mailto:torontosac@gmail.com" target="_blank" rel="noopener noreferrer">torontosac@gmail.com</a>
              <a href="https://maps.google.com/?q=Rua+Mesquita,+384,+Vila+Deodoro,+SP" target="_blank" rel="noopener noreferrer">Rua Mesquita, 384<br />Vila Deodoro, SP</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright-stack">
            <a 
              href="/admin/login" 
              className="admin-access-link"
              aria-label="Painel"
              title="Painel"
            >
              painel
            </a>
            <span>{footer.copyright}</span>
          </div>
        </div>
      </footer>

      <a className="whatsapp-float-real" href={hero.cta_url} target="_blank" rel="noopener noreferrer" aria-label="Fale pelo WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </>
  );
}
