import type { Metadata } from "next";
import { Suspense } from "react";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";
import JourneyPageClient from "./journey-client";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.journey);

export default function JourneyPage() {
  return (
    <Suspense fallback={null}>
      <JourneyPageClient />
    </Suspense>
  );
}
