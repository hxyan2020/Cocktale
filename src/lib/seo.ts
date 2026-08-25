import type { Metadata } from "next";
import type { Cocktail } from "@/lib/types";
import type { Product } from "@/lib/commerce-types";

export const SITE_URL = "https://cocktale.vercel.app";
export const SITE_NAME = "Cocktale";
export const SITE_TAGLINE =
  "What should I drink tonight? Cocktails matched to weather, mood, and taste";

const DEFAULT_OG_IMAGE = {
  url: "/cocktail-backdrop.webp",
  width: 1200,
  height: 630,
  alt: "Cocktale — personalized cocktail discovery, recipes, and home bar shopping",
};

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
  follow?: boolean;
  ogImage?: string;
};

export const PAGE_SEO = {
  home: {
    title: "What Cocktail Should I Drink Tonight?",
    description:
      "Cocktale finds the right cocktail for tonight using local weather, your mood, and taste history. Browse classic recipes, keep a tasting journal, and shop ingredients, glassware, and bar tools.",
    path: "/",
    keywords: [
      "what cocktail should I drink tonight",
      "personalized cocktail recommendations",
      "weather based cocktail suggestions",
      "cocktail for my mood",
      "cocktail discovery app",
      "classic cocktail recipes",
      "cocktail tasting journal",
      "home bar ingredients shop",
      "mixology app",
      "rainy day cocktails",
    ],
  },
  feed: {
    title: "Tonight's Cocktail Picks for Your Mood & Weather",
    description:
      "Swipe ranked cocktail recommendations for tonight — matched to local weather, mood, flavor preferences, recipe complexity, and what you have already tried.",
    path: "/feed",
    keywords: [
      "cocktail recommendations for tonight",
      "weather cocktail pairing",
      "cocktail for my mood",
      "rainy day cocktail ideas",
      "hot weather cocktails",
      "cozy cocktail suggestions",
      "swipe cocktail recipes",
      "personalized drink picker",
      "AI cocktail suggestions",
    ],
  },
  catalogue: {
    title: "Classic & Modern Cocktail Recipes Library",
    description:
      "Search hundreds of cocktail recipes by name, spirit, ingredient, glassware, origin, or category. From Negroni and Margarita to modern signatures — your mixology library.",
    path: "/catalogue",
    keywords: [
      "cocktail recipe library",
      "classic cocktail recipes",
      "Negroni recipe",
      "Margarita recipe",
      "Old Fashioned recipe",
      "search cocktails by ingredient",
      "IBA cocktail recipes",
      "mixology recipe database",
      "gin cocktails",
      "whiskey cocktails",
      "vodka cocktails",
    ],
  },
  market: {
    title: "Buy Cocktail Ingredients, Glassware & Bar Tools",
    description:
      "Shop spirits, mixers, garnishes, cocktail glassware, and bar tools for the recipes you want to make. Build a home bar with products linked to Cocktale cocktails.",
    path: "/market",
    keywords: [
      "buy cocktail ingredients online",
      "home bar supplies",
      "cocktail glassware shop",
      "bar tools jigger shaker",
      "cocktail mixers and garnishes",
      "spirits for cocktails",
      "home bartender kit",
      "cocktail market",
    ],
  },
  cart: {
    title: "Shopping Cart",
    description:
      "Review cocktail ingredients, glassware, and bar tools in your Cocktale cart before secure checkout.",
    path: "/cart",
    keywords: ["cocktail shopping cart", "bar tools cart"],
    index: false,
  },
  login: {
    title: "Sign In to Your Cocktail Journey",
    description:
      "Sign in to Cocktale to save collected cocktails, sync your tasting journal, and unlock personalized drink recommendations.",
    path: "/login",
    keywords: ["cocktale login", "cocktail app sign in"],
    index: false,
  },
  contact: {
    title: "Contact Cocktale — Orders, Recipes & Account Help",
    description:
      "Need help with a market order, cocktail recipe, or your Cocktale account? Contact support for discovery, shopping, tasting journal, and checkout questions.",
    path: "/contact",
    keywords: [
      "contact cocktale",
      "cocktail app customer support",
      "cocktale order help",
      "cocktail recipe questions",
      "home bar shopping support",
    ],
  },
  terms: {
    title: "Terms of Use",
    description:
      "Cocktale terms of use for accounts, cocktail recommendations, market purchases, and responsible drinking guidance.",
    path: "/terms",
    keywords: ["cocktale terms of use", "cocktail app terms"],
  },
  journey: {
    title: "My Cocktail Collection & Tasting Journal",
    description:
      "Track cocktails you collected and tried, add tasting notes and dates, and see how your flavor preferences evolve on your personal cocktail journey.",
    path: "/journey",
    keywords: [
      "cocktail tasting journal",
      "cocktail collection tracker",
      "drinks I have tried",
      "cocktail tasting notes",
      "personal mixology journal",
      "saved cocktail favorites",
    ],
  },
  journal: {
    title: "Cocktail Tasting Journal",
    description:
      "Log cocktails you have tried with dates and tasting notes. Continues in your Cocktale journey journal.",
    path: "/journal",
    keywords: ["cocktail journal", "tasting notes", "drinks tried"],
    index: false,
  },
  book: {
    title: "Collected Cocktail Book",
    description:
      "Your saved cocktail favorites — open them from your Cocktale journey collection.",
    path: "/book",
    keywords: ["cocktail collection book", "saved cocktail recipes"],
    index: false,
  },
  orders: {
    title: "Your Cocktail Market Orders",
    description: "View Cocktale market order history for cocktail ingredients, glassware, and bar tools.",
    path: "/orders",
    keywords: ["cocktale orders", "cocktail ingredient orders"],
    index: false,
  },
  orderSuccess: {
    title: "Order Confirmed",
    description: "Your Cocktale market order was placed successfully.",
    path: "/orders/success",
    index: false,
  },
  admin: {
    title: "Admin",
    description: "Cocktale administration.",
    path: "/admin",
    index: false,
    follow: false,
  },
} as const satisfies Record<string, PageSeo>;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return new URL(path, SITE_URL).toString();
}

export function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** SEO-friendly cocktail path: /cocktail/negroni-11003 */
export function cocktailSeoPath(cocktail: Pick<Cocktail, "id" | "name">): string {
  const slug = slugifySegment(cocktail.name) || "cocktail";
  return `/cocktail/${slug}-${cocktail.id}`;
}

export function cocktailIdFromSeoSlug(slug: string): string | null {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  // Prefer custom-* ids preserved at the end
  const customIdx = trimmed.lastIndexOf("-custom-");
  if (customIdx >= 0) return trimmed.slice(customIdx + 1);
  const dash = trimmed.lastIndexOf("-");
  if (dash < 0) return trimmed;
  return trimmed.slice(dash + 1) || null;
}

export function createPageMetadata(page: PageSeo, overrides?: Partial<Metadata>): Metadata {
  const index = page.index ?? true;
  const follow = page.follow ?? index;
  const title = page.title;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = page.ogImage
    ? { url: page.ogImage, width: 1200, height: 630, alt: page.title }
    : DEFAULT_OG_IMAGE;
  const ogImageAbs = {
    ...ogImage,
    url: absoluteUrl(typeof ogImage.url === "string" ? ogImage.url : String(ogImage.url)),
  };

  return {
    title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: absoluteUrl(page.path),
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: absoluteUrl(page.path),
      siteName: SITE_NAME,
      title: fullTitle,
      description: page.description,
      images: [ogImageAbs],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [ogImageAbs.url],
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow, googleBot: { index: false, follow } },
    ...overrides,
  };
}

export function cocktailPageSeo(cocktail: Cocktail): PageSeo {
  const spirits = cocktail.ingredients
    .map((i) => i.name)
    .slice(0, 4)
    .join(", ");
  const moods = cocktail.moods.slice(0, 3).join(", ");
  return {
    title: `${cocktail.name} Cocktail Recipe${cocktail.glass ? ` (${cocktail.glass})` : ""}`,
    description:
      cocktail.description?.trim() ||
      `How to make a ${cocktail.name} cocktail${spirits ? ` with ${spirits}` : ""}. Ingredients, steps${cocktail.origin ? `, origin ${cocktail.origin}` : ""}${moods ? `, best for ${moods}` : ""}.`,
    path: cocktailSeoPath(cocktail),
    keywords: [
      `${cocktail.name} cocktail recipe`,
      `how to make ${cocktail.name}`,
      cocktail.name,
      cocktail.glass,
      cocktail.category,
      cocktail.origin,
      ...cocktail.ingredients.slice(0, 5).map((i) => i.name),
      ...cocktail.moods.slice(0, 3),
      ...cocktail.flavorProfile.slice(0, 3),
      "cocktail recipe",
      "mixology",
    ].filter(Boolean),
    ogImage: cocktail.image?.startsWith("http") ? cocktail.image : undefined,
  };
}

export function productPageSeo(product: {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand?: string;
  subcategory?: string;
  tags?: string[];
  images?: { url: string; alt: string }[];
}): PageSeo {
  const categoryLabel =
    product.category === "utensil"
      ? "bar tool"
      : product.category === "glassware"
        ? "cocktail glassware"
        : product.category === "accessory"
          ? "bar accessory"
          : "cocktail ingredient";

  const image = product.images?.[0];
  return {
    title: `Buy ${product.name} Online — ${categoryLabel} for Home Bars`,
    description:
      product.description?.trim() ||
      `Shop ${product.name}${product.brand ? ` by ${product.brand}` : ""} on Cocktale. Pair this ${categoryLabel} with cocktail recipes and stock your home bar.`,
    path: `/market/${product.slug}`,
    keywords: [
      `buy ${product.name}`,
      `buy ${product.name} online`,
      product.name,
      categoryLabel,
      product.subcategory || "",
      "cocktail ingredients",
      "home bar supplies",
      "cocktale market",
      product.brand || "",
      ...(product.tags || []).slice(0, 4),
    ].filter(Boolean),
    ogImage: image?.url,
  };
}

export function orderDetailSeo(orderId: string): PageSeo {
  return {
    title: `Order ${orderId.slice(0, 8)}`,
    description: "Private Cocktale order details for cocktail ingredients and bar tools.",
    path: `/orders/${orderId}`,
    index: false,
    follow: false,
  };
}

export function rootMetadata(): Metadata {
  const home = PAGE_SEO.home;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${home.title}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: home.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Food & Drink",
    keywords: home.keywords,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: home.description,
      images: [
        {
          ...DEFAULT_OG_IMAGE,
          url: absoluteUrl(DEFAULT_OG_IMAGE.url),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: home.description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE.url)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
      shortcut: "/icon.png",
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

export const HOME_FAQS = [
  {
    question: "How does Cocktale recommend a cocktail for tonight?",
    answer:
      "Cocktale ranks recipes using local weather, the mood and flavors you choose, recipe complexity, and your tasting history so you get drinks that fit tonight—not a random list.",
  },
  {
    question: "Can I browse classic cocktail recipes?",
    answer:
      "Yes. The catalogue includes classic and modern cocktails you can search by name, spirit, ingredient, glassware, origin, or category.",
  },
  {
    question: "Does Cocktale include a tasting journal?",
    answer:
      "Your journey tracks cocktails you collect and try, with dates and tasting notes so you remember what you loved.",
  },
  {
    question: "Can I buy ingredients and bar tools?",
    answer:
      "The Cocktale market sells spirits, mixers, glassware, and bar tools linked to the recipes you want to make at home.",
  },
] as const;

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/logo.png"),
        description: SITE_TAGLINE,
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: PAGE_SEO.home.description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/catalogue?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: PAGE_SEO.home.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Weather and mood based cocktail recommendations",
          "Cocktail recipe catalogue",
          "Tasting journal and collection",
          "Ingredients and bar tools marketplace",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: HOME_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function recipeJsonLd(cocktail: Cocktail) {
  const image = cocktail.image?.startsWith("http")
    ? cocktail.image
    : cocktail.image
      ? absoluteUrl(cocktail.image)
      : absoluteUrl("/cocktail-backdrop.webp");

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: `${cocktail.name} Cocktail`,
    description: cocktail.description || `Recipe for a ${cocktail.name} cocktail.`,
    image: [image],
    recipeCategory: cocktail.category || "Cocktail",
    recipeCuisine: cocktail.origin || undefined,
    keywords: [...cocktail.tags, ...cocktail.flavorProfile, ...cocktail.moods]
      .filter(Boolean)
      .join(", "),
    recipeIngredient: cocktail.ingredients.map((i) =>
      i.measure ? `${i.measure} ${i.name}` : i.name,
    ),
    recipeInstructions: cocktail.instructions.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
    recipeYield: "1 cocktail",
    url: absoluteUrl(cocktailSeoPath(cocktail)),
    mainEntityOfPage: absoluteUrl(cocktailSeoPath(cocktail)),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function itemListJsonLd(
  name: string,
  description: string,
  items: Array<{ name: string; url: string; image?: string; position: number }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      url: item.url,
      name: item.name,
      image: item.image,
    })),
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function productJsonLd(product: Product) {
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
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };
}
