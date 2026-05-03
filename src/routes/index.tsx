import { createFileRoute } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { useSiteContent } from "@/hooks/useSiteContent";
import { lazy, Suspense } from "react";

const InstagramCarousel3D = lazy(() => import("@/components/InstagramCarousel3D"));

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { content } = useSiteContent(false);
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SiteSections content={content} />
    </Suspense>
  );
}
