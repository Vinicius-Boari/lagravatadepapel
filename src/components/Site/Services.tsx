import { cn } from "@/lib/utils";
import { memo } from "react";
import { EditableElement } from "@/components/admin/EditableElement";

interface ServicesProps {
  services: any;
}

export const Services = memo(({ services }: ServicesProps) => {
  return (
    <section className="services-section" id="servicos">
      <header className="flex flex-col items-center justify-center mb-8 reveal">
        <span className="text-red-600 font-bold uppercase tracking-[0.2em] text-[10px] md:text-[12px] mb-2">Os Originais</span>
        <p className="text-gray-500 italic text-sm md:text-base">A hora da gravata nunca foi tão divertida</p>
      </header>
      <div className="section-header reveal">
        <EditableElement section="services" field="heading" type="text" label="Título Serviços">
          <h2>{services.heading}<br /><span>{services.heading_em}</span></h2>
        </EditableElement>
      </div>
      <div className="services-grid scene-3d">
        {(services.items ?? []).map((s: any, i: number) => (
          <div className={cn("service-card tilt-3d scroll-3d reveal", s.show_mobile === false && "hidden md:block")} key={i}>
            <EditableElement section="services" field={`items[${i}].img`} type="image" label={`Imagem ${s.title}`}>
              <img src={s.img} alt={`${s.title} - Serviço de animação La Gravata de Papel`} loading="lazy" />
            </EditableElement>
            <div className="service-card-overlay">
              <EditableElement section="services" field={`items[${i}].title`} type="text" label="Título do Serviço">
                <h3>{s.title}</h3>
              </EditableElement>
              <EditableElement section="services" field={`items[${i}].desc`} type="textarea" label="Descrição do Serviço">
                <p>{s.desc}</p>
              </EditableElement>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Services.displayName = "Services";
