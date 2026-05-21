import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { content } = useSiteContent(false);
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
