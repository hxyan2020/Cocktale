import type { Metadata } from "next";
import { breadcrumbJsonLd, createPageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.journey);

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Journey", path: "/journey" },
            ]),
          ),
        }}
      />
      {children}
    </>
  );
}
