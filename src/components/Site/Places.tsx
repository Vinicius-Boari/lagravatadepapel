import { cn } from "@/lib/utils";
import { memo } from "react";

interface PlacesProps {
  places: any;
}

export const Places = memo(({ places }: PlacesProps) => {
  return (
    <section className="places-section" id="invasoes">
      <div className="places-header reveal">
        <h2>{places.heading}<br />{places.heading2}</h2>
        <a href={places.instagram_url} target="_blank" rel="noopener noreferrer">
          Ver no Instagram →
        </a>
      </div>
      <div className="places-grid scene-3d">
        {(places.items ?? []).map((p: any, i: number) => (
          <div className={cn("place-card tilt-3d scroll-3d reveal", p.show_mobile === false && "hidden md:block")} key={i}>
            <img src={p.img} alt={`Invasão Tropa da Gravata em ${p.title}`} />
            <div className="place-card-overlay">
              <h3>{p.title}</h3>
              <span>{p.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Places.displayName = "Places";
