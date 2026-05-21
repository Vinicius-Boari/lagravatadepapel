import { memo } from "react";

const tickerItems = [
  "LA GRAVATA DE PAPEL", "OS ORIGINAIS", "TROPA DA GRAVATA",
  "LA GRAVATA DE PAPEL", "OS ORIGINAIS", "TROPA DA GRAVATA",
];

export const Ticker = memo(() => {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...tickerItems, ...tickerItems].map((t, i) => (
          <span key={i}>{t} •</span>
        ))}
      </div>
    </div>
  );
});

Ticker.displayName = "Ticker";
