import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";


interface TropaProps {
  tropaConfig: any;
}

export const Tropa = memo(({ tropaConfig }: TropaProps) => {
  return (
    <section className="about-section" id="tropa-da-gravata" style={{ background: 'var(--color-black-lg)', color: 'var(--color-white-lg)' }}>
      <div className="about-text" style={{ background: 'transparent' }}>
        
          <h2 className="reveal">{(tropaConfig?.heading || "A Tropa Invadiu")}<br /><em>{(tropaConfig?.heading_em || "Seu Casamento")}</em></h2>
        

        <div className="space-y-6 text-left mb-10">
          
            <p className="text-red-500 font-bold italic mb-4">{(tropaConfig?.subheading || "A hora da gravata nunca mais será a mesma.")}</p>
          

          
            <div>
              {(tropaConfig?.paragraphs || []).map((p: string, i: number) => (
                <p key={i} className="opacity-60">{p}</p>
              ))}
            </div>
          
        </div>
        
        <div className="mt-8">
          <p className="text-white/80 mb-6 font-bold uppercase tracking-widest text-[10px]">Quer essa operação no seu evento?</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
              <a href="/questionarioevento" className="btn-outline" onClick={(e) => e.preventDefault()}>
                <span>{(tropaConfig?.cta_label || "Contrate Agora")}</span>
                <span>→</span>
              </a>
            

            
              <a 
                href={tropaConfig?.instagram_url || "https://www.instagram.com/tropadagravata/"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-red-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold border-b border-red-500/30 pb-1"
                onClick={(e) => e.preventDefault()}
              >
                <Instagram className="w-4 h-4" />
                <span>{(tropaConfig?.instagram_label || "Ver no Instagram")} →</span>
              </a>
            
          </div>
        </div>
      </div>
      <div className={cn("about-image scene-3d", tropaConfig?.show_mobile === false && "hidden md:block")}>
        <div className="scroll-3d tilt-3d">
          
            <img src={tropaConfig?.image_url || "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/message-attachments/fa1e2554-75eb-47f0-ba93-607583130d73/Instagram_files/561755360_18109376935599626_8280922716105922460_n.jpg"} alt="Tropa da Gravata" />
          
        </div>
      </div>
    </section>
  );
});

Tropa.displayName = "Tropa";
