import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { absoluteUrl, createPageMetadata, productPageSeo, SITE_URL } from "@/lib/seo";

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

function productJsonLd(product: NonNullable<ReturnType<typeof getProductBySlug>>) {
  const image = product.images[0]?.url;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : { "@type": "Brand", name: "Cocktale Market" },
    category: product.category,
    image: image ? [image.startsWith("http") ? image : absoluteUrl(image)] : undefined,
    url: absoluteUrl(`/market/${product.slug}`),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/market/${product.slug}`),
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Cocktale",
        url: SITE_URL,
      },
    },
  };
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
