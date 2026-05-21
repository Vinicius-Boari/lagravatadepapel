import { Instagram, MessageCircle, Video as TikTokIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";


interface HeaderProps {
  isScrolled: boolean;
  onMenuClick: () => void;
  content?: any;
}

export const Header = memo(({ isScrolled, onMenuClick, content }: HeaderProps) => {
  const instagramUrl = content?.integrations?.instagram_url || "https://www.instagram.com/lagravatadepapel/";
  const whatsappUrl = content?.hero?.cta_url || "https://api.whatsapp.com/send?phone=5511985111012";
  const tiktokUrl = "https://www.tiktok.com/@lagravatadepapel";

  return (
    <header className={cn("lg-header", isScrolled && "header-sticky")} style={{ mixBlendMode: 'normal' }}>
      <div 
        className="logo cursor-pointer" 
        style={{ color: '#FFFFFF', mixBlendMode: 'normal' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="button"
        aria-label="Voltar ao topo"
      >
        <div>
          <div className="logo-text">La Gravata<br />de Papel</div>
        </div>
        <span className="logo-tagline">Os Originais</span>
      </div>

      <div className="header-center flex-1 flex flex-col items-center justify-center px-4">
        <span className="text-[12px] md:text-[18px] lg:text-[20px] text-white font-serif tracking-widest text-center uppercase leading-tight drop-shadow-lg opacity-90">
          a hora da gravata nunca foi tão divertida
        </span>
      </div>

      <div className="nav-right flex items-center gap-2 md:gap-4 lg:gap-6">
        <div className="hidden sm:flex items-center gap-4 lg:gap-6 mr-4">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="header-social-link p-2 rounded-full hover:bg-white/10 transition-colors" title="Siga no Instagram">
            <Instagram className="w-5 h-5 text-white" />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="header-social-link p-2 rounded-full hover:bg-white/10 transition-colors" title="Fale pelo WhatsApp">
            <MessageCircle className="w-5 h-5 text-white" />
          </a>
          <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="header-social-link p-2 rounded-full hover:bg-white/10 transition-colors" title="Siga no TikTok">
            <TikTokIcon className="w-5 h-5 text-white" />
          </a>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          
            <a href="/questionarioevento" className="orcamento-header-btn">
              <span>{content?.hero?.cta_label || "ORÇAMENTO"}</span>
            </a>
          
          <button className="menu-btn" onClick={onMenuClick} aria-label="Abrir menu">
            <span>MENU</span>
          </button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
