import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PagePayload = {
  title: string;
  is_published: boolean;
  published: { sections?: Array<{ heading?: string; text?: string; image?: string }> };
};

export const Route = createFileRoute("/p/$slug")({
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ? `${loaderData.title} — La Gravata de Papel` : "La Gravata de Papel" },
    ],
  }),
  component: ExtraPage,
});

function ExtraPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<PagePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("pages")
        .select("title, is_published, published")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setPage(data as PagePayload | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <CenterMsg>Carregando...</CenterMsg>;
  }
  if (!page) {
    return (
      <div style={wrap}>
        <div style={{ maxWidth: 600, textAlign: "center", padding: 40 }}>
          <h1 style={{ fontSize: 48, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>404</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>Esta página não existe ou ainda não foi publicada.</p>
          <Link to="/" style={btn}>← Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const sections = page.published?.sections ?? [];

  return (
    <div style={wrap}>
      <header style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <Link to="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
          ← La Gravata de Papel
        </Link>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "60px 24px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 64px)", marginBottom: 40, lineHeight: 1.05 }}>
          {page.title}
        </h1>
        {sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 48 }}>
            {s.image && (
              <img src={s.image} alt={s.heading ?? ""} style={{ width: "100%", borderRadius: 12, marginBottom: 20 }} />
            )}
            {s.heading && (
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>{s.heading}</h2>
            )}
            {s.text && (
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>{s.text}</p>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}

function CenterMsg({ children }: { children: React.ReactNode }) {
  return <div style={{ ...wrap, display: "grid", placeItems: "center" }}>{children}</div>;
}

const wrap: React.CSSProperties = {
  minHeight: "100vh", background: "#0a0a0a", color: "white",
  fontFamily: "Inter, sans-serif",
};
const btn: React.CSSProperties = {
  display: "inline-block", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 999, color: "white", textDecoration: "none", fontSize: 14,
};
