/**
 * SiteSections Component
 * 
 * This is the main layout component that orchestrates all the sections of the public site.
 * It handles global UI states like scrolling, mobile detection, and mouse trail animations.
 */
import { useEffect, useRef, useState, memo, useCallback } from "react";
import type { SiteContent } from "@/hooks/useSiteContent";
import { InstagramCarousel3D } from "@/components/InstagramCarousel3D";

// Lazy loaded modularized components
import { lazy, Suspense } from "react";
const Header = lazy(() => import("./Site/Header").then(m => ({ default: m.Header })));
const FullscreenMenu = lazy(() => import("./Site/FullscreenMenu").then(m => ({ default: m.FullscreenMenu })));
const Hero = lazy(() => import("./Site/Hero").then(m => ({ default: m.Hero })));
const Ticker = lazy(() => import("./Site/Ticker").then(m => ({ default: m.Ticker })));
const Services = lazy(() => import("./Site/Services").then(m => ({ default: m.Services })));
const VideoGrid = lazy(() => import("./Site/VideoGrid").then(m => ({ default: m.VideoGrid })));
const ThePlan = lazy(() => import("./Site/ThePlan").then(m => ({ default: m.ThePlan })));
const Places = lazy(() => import("./Site/Places").then(m => ({ default: m.Places })));
const About = lazy(() => import("./Site/About").then(m => ({ default: m.About })));
const Tropa = lazy(() => import("./Site/Tropa").then(m => ({ default: m.Tropa })));
const Coupons = lazy(() => import("./Site/Coupons").then(m => ({ default: m.Coupons })));
const Contacts = lazy(() => import("./Site/Contacts").then(m => ({ default: m.Contacts })));
const Footer = lazy(() => import("./Site/Footer").then(m => ({ default: m.Footer })));


export const SiteSections = memo(function SiteSections({ content, onMenuClick }: { content: SiteContent; onMenuClick?: () => void }) {
  // --- UI States ---
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [clickedVideos, setClickedVideos] = useState<Record<string, boolean>>({});
  const [videoLoaded, setVideoLoaded] = useState<Record<string, boolean>>({});
  
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroImgsRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to handle responsive checks and global scroll events.
   */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    let scrollTicking = false;
    const handleScroll = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getLimitedVideoUrl = useCallback((url: string) => {
    if (!url) return url;
    if (isMobile) {
      return url.includes("#") ? url : `${url}#t=0,8`;
    }
    return url;
  }, [isMobile]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isMobile && e.currentTarget.currentTime >= 8) {
      e.currentTarget.currentTime = 0;
      e.currentTarget.play().catch(() => {});
    }
  }, [isMobile]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => { 
    setMenuOpen(true); 
    onMenuClick?.(); 
  }, [onMenuClick]);

  useEffect(() => {
    document.body.classList.add("lg-body");

    // Optimized Intersection Observer for Videos
    const videoObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (video.paused) {
                video.play().catch(() => {});
              }
            }, 50);
          } else {
            video.pause();
            if (window.innerWidth < 768) {
              video.preload = "none";
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    document.querySelectorAll('video').forEach(v => videoObs.observe(v));

    return () => {
      document.body.classList.remove("lg-body");
      videoObs.disconnect();
    };
  }, []);

  useEffect(() => {
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
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        trailX += (mx - trailX) * 0.15;
        trailY += (my - trailY) * 0.15;

        points.push({ x: trailX, y: trailY });
        if (points.length > maxPoints) points.shift();

        if (points.length > 1) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const progress = i / points.length; 
            const opacity = progress * 0.5;
            const width = progress * 2.5; 
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(192, 57, 43, ${opacity})`;
            ctx.lineWidth = width;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        raf = requestAnimationFrame(animate);
      } catch (err) {
        cancelAnimationFrame(raf);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMove);
    resize();
    raf = requestAnimationFrame(animate);

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 100);
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

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
    let ticking = false;

    const updateScrollEffects = () => {
      const c = window.scrollY;
      
      if (window.innerWidth >= 768 && heroImgsRef.current) {
        if (c < window.innerHeight * 1.5) {
          const imgs = heroImgsRef.current.querySelectorAll<HTMLDivElement>(".hero-img");
          if (imgs[0]) imgs[0].style.transform = `rotateY(-6deg) rotateZ(-6deg) translateY(${c * 0.1}px) translateZ(0)`;
          if (imgs[1]) imgs[1].style.transform = `translate(-50%, -50%) rotateZ(2deg) translateY(${c * 0.05}px) translateZ(0)`;
          if (imgs[2]) imgs[2].style.transform = `rotateY(6deg) rotateZ(5deg) translateY(${c * 0.08}px) translateZ(0)`;
        }

        scrollEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top > window.innerHeight || r.bottom < 0) return;
          const vh = window.innerHeight;
          const progress = (r.top + r.height / 2 - vh / 2) / vh;
          const clamped = Math.max(-1, Math.min(1, progress));
          el.style.setProperty("--sx", `${clamped * 8}deg`);
          el.style.setProperty("--sy", `${clamped * -10}deg`);
          el.style.setProperty("--sz", `${-Math.abs(clamped) * 60}px`);
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollEffects();

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
      revealObs.disconnect();
    };
  }, [content]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10000,
          mixBlendMode: "difference",
        }}
      />

      <Suspense fallback={null}>
        <Header isScrolled={isScrolled} onMenuClick={openMenu} content={content} />
        <FullscreenMenu menuOpen={menuOpen} onClose={closeMenu} />
        
        <Hero 
          hero={content.hero} 
          heroImgsRef={heroImgsRef} 
          getLimitedVideoUrl={getLimitedVideoUrl} 
          handleTimeUpdate={handleTimeUpdate} 
        />
        
        <Ticker />
        <Services services={content.services} />
        
        <VideoGrid 
          videos={content.videos}
          isMobile={isMobile}
          clickedVideos={clickedVideos}
          videoLoaded={videoLoaded}
          setClickedVideos={setClickedVideos}
          setVideoLoaded={setVideoLoaded}
          handleTimeUpdate={handleTimeUpdate}
          getLimitedVideoUrl={getLimitedVideoUrl}
        />
        
        <ThePlan plan={content.plan} />
        <Places places={content.places} />
        
        <InstagramCarousel3D config={content.instagram_config ?? {}} />
        
        <About about={content.about} />
        <Tropa tropaConfig={content.tropa_config} />
        <Coupons coupons={content.coupons} />
        <Contacts content={content} />
        <Footer footer={content.footer} content={content} />
      </Suspense>

      
      <a className="whatsapp-float-real" href={content.hero?.cta_url} target="_blank" rel="noopener noreferrer" aria-label="Fale pelo WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>
    </>
  );
});
