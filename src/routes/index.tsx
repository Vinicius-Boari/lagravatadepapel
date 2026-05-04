import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { content } = useSiteContent(false);
  return <SiteSections content={content} />;
}
