/**
 * Home Route (index)
 * 
 * Entry point for the public website.
 * Loads site content, injects SEO meta tags, and renders the SiteSections orchestration component.
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useVisualEditor } from "@/components/admin/VisualEditorContext";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // Use draftContent from the context which automatically handles draft/published switching
  const { draftContent } = useVisualEditor();
  
  return (
    <>
      <SEO 
        title={draftContent.seo?.title}
        description={draftContent.seo?.description}
        keywords={draftContent.seo?.keywords}
      />
      <SiteSections content={draftContent} />
    </>
  );
}
