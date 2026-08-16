import type { Metadata } from "next";

export const SITE_URL = "https://cocktale.vercel.app";
export const SITE_NAME = "Cocktale";
export const SITE_TAGLINE = "Discover, collect, and taste cocktails matched to you";

const DEFAULT_OG_IMAGE = {
  url: "/cocktail-backdrop.webp",
  width: 1200,
  height: 630,
  alt: "Cocktale — cocktail discovery and tasting",
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
    title: "Personalized Cocktail Discovery, Recipes & Tasting Journal",
    description:
      "Cocktale recommends cocktails by weather, mood, and taste history. Browse recipes, collect favorites, keep a tasting journal, and shop ingredients and bar tools.",
    path: "/",
    keywords: [
      "cocktail discovery app",
      "personalized cocktail recommendations",
      "weather based cocktails",
      "cocktail recipes",
      "cocktail tasting journal",
      "mixology app",
      "cocktail ingredients shop",
    ],
  },
  feed: {
    title: "Tonight's Cocktail Recommendations",
    description:
      "Swipe personalized cocktail recommendations ranked by local weather, mood, flavor preferences, recipe complexity, and your tasting history.",
    path: "/feed",
    keywords: [
      "cocktail recommendations",
      "tonight's cocktails",
      "weather cocktail pairing",
      "personalized drinks",
      "swipe cocktail recipes",
      "AI cocktail suggestions",
    ],
  },
  catalogue: {
    title: "Cocktail Recipe Catalogue & Mixology Library",
    description:
      "Browse the full Cocktale recipe library. Search classic and modern cocktails by name, ingredient, glassware, origin, or category.",
    path: "/catalogue",
    keywords: [
      "cocktail recipe catalogue",
      "cocktail recipe library",
      "classic cocktail recipes",
      "search cocktails by ingredient",
      "mixology recipes",
      "drink recipes database",
    ],
  },
  market: {
    title: "Cocktail Ingredients, Glassware & Bar Tools Market",
    description:
      "Shop spirits, mixers, glassware, and bar tools for the cocktails you want to make. Curated products linked to Cocktale recipes.",
    path: "/market",
    keywords: [
      "buy cocktail ingredients",
      "bar tools shop",
      "cocktail glassware",
      "mixer and spirits",
      "home bar supplies",
      "cocktail market",
    ],
  },
  cart: {
    title: "Shopping Cart",
    description: "Review cocktail ingredients, glassware, and bar tools in your Cocktale cart before checkout.",
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
    title: "Contact Cocktale Support",
    description:
      "Questions about an order, cocktail recipe, or your Cocktale account? Contact the Cocktale team for help with discovery, shopping, and tasting.",
    path: "/contact",
    keywords: [
      "contact cocktale",
      "cocktail app support",
      "cocktale help",
      "cocktail order support",
    ],
  },
  terms: {
    title: "Terms of Use",
    description:
      "Read the Cocktale terms of use covering accounts, cocktail recommendations, market purchases, and responsible drinking guidance.",
    path: "/terms",
    keywords: ["cocktale terms of use", "cocktail app terms"],
  },
  journey: {
    title: "My Cocktail Journey & Tasting Journal",
    description:
      "Track collected cocktails, tasting notes, dates you tried each drink, and the story of your personal cocktail journey with Cocktale.",
    path: "/journey",
    keywords: [
      "cocktail tasting journal",
      "cocktail collection",
      "drinks I tried",
      "personal cocktail book",
      "mixology journal",
      "tasting notes app",
    ],
  },
  journal: {
    title: "Cocktail Tasting Journal",
    description:
      "Log the cocktails you have tried with dates and tasting notes. Your Cocktale journal keeps every pour you actually tasted.",
    path: "/journal",
    keywords: ["cocktail journal", "tasting notes", "drinks tried"],
  },
  book: {
    title: "Your Collected Cocktail Book",
    description:
      "Revisit cocktails you collected on Cocktale — favorites saved to buy ingredients for, remake, and taste again.",
    path: "/book",
    keywords: ["cocktail collection book", "saved cocktail recipes", "favorite cocktails"],
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
    description: "Your Cocktale market order was placed successfully. Track ingredients and bar tools headed your way.",
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

export function createPageMetadata(page: PageSeo, overrides?: Partial<Metadata>): Metadata {
  const index = page.index ?? true;
  const follow = page.follow ?? index;
  const title = page.title.includes(SITE_NAME) ? page.title : page.title;
  const ogImage = page.ogImage
    ? { url: page.ogImage, alt: page.title }
    : DEFAULT_OG_IMAGE;

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
      title: `${title} | ${SITE_NAME}`,
      description: page.description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: page.description,
      images: [typeof ogImage.url === "string" ? ogImage.url : ogImage.url],
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow, googleBot: { index: false, follow } },
    ...overrides,
  };
}

export function productPageSeo(product: {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand?: string;
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
    title: `Buy ${product.name} — ${categoryLabel} for cocktails`,
    description:
      product.description?.trim() ||
      `Shop ${product.name}${product.brand ? ` by ${product.brand}` : ""} on Cocktale. Pair this ${categoryLabel} with cocktail recipes and build your home bar.`,
    path: `/market/${product.slug}`,
    keywords: [
      `buy ${product.name}`,
      product.name,
      categoryLabel,
      "cocktail ingredients",
      "home bar",
      "cocktale market",
      product.brand || "",
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
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: home.description,
      images: [DEFAULT_OG_IMAGE.url],
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
      },
    ],
  };
}
