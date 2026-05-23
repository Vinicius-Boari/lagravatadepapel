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
    // Return a minimal version or the fallback for SSR if loading
    // This helps avoid 500 errors if the first fetch hangs
    return <SiteSections content={content} />;
  }

  return (
    <>
      <SEO 
        title={content.seo?.title}
        description={content.seo?.description}
        keywords={content.seo?.keywords}
      />
      <SiteSections content={content} />
    </>
  );
}
