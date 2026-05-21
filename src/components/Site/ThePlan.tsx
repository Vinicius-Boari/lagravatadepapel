import { memo } from "react";

interface ThePlanProps {
  plan: any;
}

export const ThePlan = memo(({ plan }: ThePlanProps) => {
  return (
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
  );
});

ThePlan.displayName = "ThePlan";
