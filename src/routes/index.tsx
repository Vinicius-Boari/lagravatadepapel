/**
 * Home Route (index)
 * 
 * Entry point for the public website.
 * Loads site content, injects SEO meta tags, and renders the SiteSections orchestration component.
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useVisualEditor } from "@/components/admin/VisualEditorContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // Use useSiteContent directly for the public index to be safer during initial render
  const { content, loading } = useSiteContent(false);
  
  if (loading && typeof window === 'undefined') {
    return null;
  }

  try {
    return (
      <>
        <SEO 
          title={content.seo?.title || "La Gravata de Papel"}
          description={content.seo?.description || "Animação de Casamentos"}
          keywords={content.seo?.keywords || "gravata, casamento"}
        />
        <SiteSections content={content} />
      </>
    );
  } catch (err) {
    console.error("Critical render error on Index page:", err);
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado ao carregar o site.</h1>
          <p className="text-zinc-500 mb-4">Estamos trabalhando para resolver isso.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
}
