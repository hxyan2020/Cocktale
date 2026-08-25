import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { createPageMetadata, productJsonLd, productPageSeo } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return createPageMetadata({
      title: "Product not found",
      description: "This Cocktale market product could not be found.",
      path: `/market/${slug}`,
      index: false,
    });
  }
  return createPageMetadata(productPageSeo(product));
}

export default async function ProductSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
        />
      ) : null}
      {children}
    </>
  );
}
