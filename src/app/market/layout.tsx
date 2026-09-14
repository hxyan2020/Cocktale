import type { Metadata } from "next";
import {
  createPageMetadata,
  PAGE_SEO,
  absoluteUrl,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.market);

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  const products = getAllProducts().slice(0, 40);
  const listLd = itemListJsonLd(
    "Cocktale market — cocktail ingredients and bar tools",
    PAGE_SEO.market.description,
    products.map((p, i) => ({
      name: p.name,
      url: absoluteUrl(`/market/${p.slug}`),
      image: p.images[0]?.url,
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
              { name: "Market", path: "/market" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionPageJsonLd(PAGE_SEO.market.title, PAGE_SEO.market.description, "/market"),
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
