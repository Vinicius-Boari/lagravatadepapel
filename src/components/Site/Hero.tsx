import { cn } from "@/lib/utils";
import { memo } from "react";

interface HeroProps {
  hero: any;
  heroImgsRef: React.RefObject<HTMLDivElement | null>;
  getLimitedVideoUrl: (url: string) => string;
  handleTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}

export const Hero = memo(({ hero, heroImgsRef, getLimitedVideoUrl, handleTimeUpdate }: HeroProps) => {
  return (
    <section className="hero relative" id="hero">
      <div className="absolute top-10 right-10 z-20 hidden lg:flex flex-col items-end opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-white font-bold uppercase tracking-[0.2em] text-[10px]">Os Originais</span>
        <span className="text-white/60 italic text-[9px] uppercase">Pioneiros em animação teatral</span>
      </div>
      {hero.video_url && (
        <div className={`hero-video-bg ${hero.show_video_mobile === false ? 'hidden md:block' : ''}`}>
          <video 
            id="hero-video"
            title="Animação de Casamento Tropa da Gravata - La Gravata de Papel"
            onTimeUpdate={handleTimeUpdate}
            autoPlay
            muted 
            loop 
            playsInline 
            webkit-playsinline="true"
            preload="metadata"
            className="will-change-transform"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            onLoadedMetadata={(e) => {
              e.currentTarget.muted = true;
            }}
          >
            <source src={getLimitedVideoUrl(hero.video_url)} type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>
        </div>
      )}

      <div className="hero-images" ref={heroImgsRef}>
        <div className={cn("hero-img hero-img-1", hero.image1_show_mobile === false && "hidden md:block")}>
          <img src={hero.image1 || "/images/hero_invasion.png"} alt={hero.image1_alt || "Animação teatral para casamentos - La Gravata de Papel"} loading="lazy" decoding="async" />
        </div>
        <div className={cn("hero-img hero-img-2", hero.image2_show_mobile === false && "hidden md:block")}>
          <img src={hero.image2 || "/images/hero_venue.png"} alt={hero.image2_alt || "Tropa da Gravata animando festa de casamento"} loading="lazy" decoding="async" />
        </div>
        <div className={cn("hero-img hero-img-3", hero.image3_show_mobile === false && "hidden md:block")}>
          <img src={hero.image3 || "/images/hero_party.png"} alt={hero.image3_alt || "Entretenimento e diversão em eventos SP"} loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          {(hero.title_lines ?? []).map((line: string, i: number, arr: string[]) =>
            i === arr.length - 1 ? <em key={i}>{line}</em> : <span key={i}>{line}<br /></span>
          )}
        </h1>
        <div className="sr-only">
          {hero.seo_hidden_text || "Animação para Casamentos, Debutantes, Festas de 15 anos e Eventos. Tropa da Gravata, Inspiração BOPE e La Casa de Papel. Tequileiros, Robô de LED, Bazuca CO2. Especialistas em transformar a hora da gravata e garantir sua lua de mel."}
        </div>
        <p className="hero-subtitle">{hero.subtitle?.split("\n").map((l: string, i: number) => (<span key={i}>{l}<br /></span>))}</p>
        {hero.cta_label && (
          <div className="hero-cta">
            <a href="/questionarioevento">
              <span className="text-white">{hero.cta_label}</span>
              <span className="cta-dot bg-red-500" />
            </a>
          </div>
        )}
      </div>

      <div className="hero-location">{hero.location?.split("\n").map((l: string, i: number) => (<span key={i}>{l}<br /></span>))}</div>
    </section>
  );
});

Hero.displayName = "Hero";
