import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/admin/preview")({
  head: () => ({
    meta: [
      { title: "Preview — Painel" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  // useDraft = true: prefere os rascunhos não publicados
  const { content, loading } = useSiteContent(true);
  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "#888", fontFamily: "Inter, sans-serif" }}>
        Carregando preview...
      </div>
    );
  }
  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        background: "#fef3c7", color: "#92400e", padding: "4px 12px",
        fontSize: 11, fontWeight: 600, textAlign: "center", letterSpacing: "0.05em",
        fontFamily: "Inter, sans-serif",
      }}>
        MODO PREVIEW — exibindo rascunhos não publicados
      </div>
      <div style={{ paddingTop: 24 }}>
        <SiteSections content={content} />
      </div>
    </>
  );
}
