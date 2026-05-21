import { cn } from "@/lib/utils";
import { memo } from "react";

interface AboutProps {
  about: any;
}

export const About = memo(({ about }: AboutProps) => {
  return (
    <section className="about-section" id="sobre">
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
      <div className={cn("about-image scene-3d", about.show_mobile === false && "hidden md:block")}>
        <div className="scroll-3d tilt-3d">
          <img 
            src={about.image || "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/message-attachments/fa1e2554-75eb-47f0-ba93-607583130d73/1778107838154_payono_image.png"} 
            alt="Biografia - La Gravata de Papel" 
          />
        </div>
      </div>
    </section>
  );
});

About.displayName = "About";
