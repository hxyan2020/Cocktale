import type { Metadata } from "next";
import {
  createPageMetadata,
  PAGE_SEO,
  absoluteUrl,
  breadcrumbJsonLd,
  cocktailSeoPath,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";
import { getAllResolvedCocktails } from "@/lib/cocktails-server";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.catalogue);

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  const top = getAllResolvedCocktails()
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 40);

  const listLd = itemListJsonLd(
    "Cocktale cocktail recipe catalogue",
    PAGE_SEO.catalogue.description,
    top.map((c, i) => ({
      name: `${c.name} cocktail recipe`,
      url: absoluteUrl(cocktailSeoPath(c)),
      image: c.image?.startsWith("http") ? c.image : undefined,
      position: i + 1,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Cocktail recipes", path: "/catalogue" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionPageJsonLd(PAGE_SEO.catalogue.title, PAGE_SEO.catalogue.description, "/catalogue"),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
      {children}
    </>
  );
}
