/**
 * Home Route (index)
 * 
 * Entry point for the public website.
 * Loads site content, injects SEO meta tags, and renders the SiteSections orchestration component.
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { content } = useSiteContent();

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

