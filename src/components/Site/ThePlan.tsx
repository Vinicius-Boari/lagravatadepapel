import { memo } from "react";
import { EditableElement } from "@/components/admin/EditableElement";

interface ThePlanProps {
  plan: any;
}

export const ThePlan = memo(({ plan }: ThePlanProps) => {
  return (
    <section className="dark-section">
      <div className="dark-content reveal">
        <EditableElement section="plan" field="heading" type="text" label="Título O Plano">
          <h2>{plan.heading}<br /><em>{plan.heading_em}</em></h2>
        </EditableElement>
        
        <EditableElement section="plan" field="text" type="textarea" label="Texto O Plano">
          <p>{plan.text}</p>
        </EditableElement>

        <EditableElement section="plan" field="cta_url" type="button" label="Botão O Plano">
          <a href="/questionarioevento" className="btn-outline">
            <span>{plan.cta_label}</span>
            <span>→</span>
          </a>
        </EditableElement>
      </div>
    </section>
  );
});

ThePlan.displayName = "ThePlan";
