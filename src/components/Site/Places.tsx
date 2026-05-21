import { cn } from "@/lib/utils";
import { memo } from "react";
import { EditableElement } from "@/components/admin/EditableElement";

interface PlacesProps {
  places: any;
}

export const Places = memo(({ places }: PlacesProps) => {
  return (
    <section className="places-section" id="invasoes">
      <div className="places-header reveal">
        <EditableElement section="places" field="heading" type="text" label="Título Invasões 1">
          <h2>{places.heading}<br />
            <EditableElement section="places" field="heading2" type="text" label="Título Invasões 2">
              <span>{places.heading2}</span>
            </EditableElement>
          </h2>
        </EditableElement>
        
        <EditableElement section="places" field="instagram_url" type="link" label="Link Instagram Invasões">
          <a href={places.instagram_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.preventDefault()}>
            Ver no Instagram →
          </a>
        </EditableElement>
      </div>
      <div className="places-grid scene-3d">
        {(places.items ?? []).map((p: any, i: number) => (
          <div className={cn("place-card tilt-3d scroll-3d reveal", p.show_mobile === false && "hidden md:block")} key={i}>
            <EditableElement section="places" field={`items[${i}].img`} type="image" label={`Imagem ${p.title}`}>
              <img src={p.img} alt={`Invasão Tropa da Gravata em ${p.title}`} />
            </EditableElement>
            <div className="place-card-overlay">
              <EditableElement section="places" field={`items[${i}].title`} type="text" label="Nome do Local">
                <h3>{p.title}</h3>
              </EditableElement>
              <EditableElement section="places" field={`items[${i}].tag`} type="text" label="Tag do Local">
                <span>{p.tag}</span>
              </EditableElement>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Places.displayName = "Places";
