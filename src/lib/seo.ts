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
    title: "What Should I Drink Tonight? Cocktails by Mood",
    description:
      "Not sure what to drink tonight? Cocktale matches cocktails to your local weather, mood, and taste, with 440+ recipes, a tasting journal, and a home-bar shop.",
    path: "/",
    keywords: [
      "what cocktail should I drink tonight",
      "what should I drink tonight",
      "cocktail recommendations",
      "cocktail generator",
      "drink picker",
      "classic cocktail recipes",
      "old fashioned recipe",
      "margarita recipe",
      "espresso martini recipe",
      "home bartender",
      "weather based cocktail suggestions",
    ],
  },
  feed: {
    title: "Tonight's Cocktail Picks by Weather & Mood",
    description:
      "Get tonight's cocktail picks ranked by your local weather, mood, flavor preferences, and what you've already tried. Swipe to save the ones you want to make.",
    path: "/feed",
    keywords: [
      "cocktails for tonight",
      "hot weather cocktails",
      "summer cocktails",
      "winter cocktails",
      "rainy day cocktail ideas",
      "cozy cocktails",
      "refreshing cocktails",
      "cocktails by mood",
      "personalized drink picker",
    ],
  },
  catalogue: {
    title: "Cocktail Recipes A–Z: Classic & Modern Drinks",
    description:
      "Browse 440+ classic and modern cocktail recipes. Search by name, spirit, ingredient, glass, or origin — from the Old Fashioned and Margarita to Negroni.",
    path: "/catalogue",
    keywords: [
      "cocktail recipes",
      "classic cocktail recipes",
      "cocktail recipe list",
      "easy cocktail recipes",
      "old fashioned recipe",
      "margarita recipe",
      "espresso martini recipe",
      "mojito recipe",
      "negroni recipe",
      "cocktails A-Z",
      "cocktails by ingredient",
    ],
  },
  market: {
    title: "Buy Cocktail Ingredients, Glassware & Bar Tools",
    description:
      "Shop spirits, mixers, syrups, garnishes, glassware, and bar tools for the cocktails you want to make. Products pair with Cocktale recipes.",
    path: "/market",
    keywords: [
      "home bar essentials",
      "cocktail kit",
      "bar tools set",
      "cocktail glassware",
      "buy cocktail ingredients online",
      "cocktail shaker",
      "jigger",
      "whiskey glasses",
      "home bartender kit",
    ],
  },
  cart: {
    title: "Shopping Cart",
    description:
      "Review cocktail ingredients, glassware, and bar tools in your Cocktale cart before secure checkout.",
    path: "/cart",
    keywords: ["cocktail shopping cart", "home bar cart"],
    index: false,
  },
  login: {
    title: "Sign In to Save Cocktails & Tasting Notes",
    description:
      "Sign in to Cocktale to save collected cocktails, sync your tasting journal, and unlock weather- and mood-based drink recommendations.",
    path: "/login",
    keywords: ["cocktale login", "cocktail journal sign in"],
    index: false,
  },
  contact: {
    title: "Contact Support — Orders, Recipes & Accounts",
    description:
      "Questions about a market order, a cocktail recipe, or your account? Reach the Cocktale team and we'll reply within one business day.",
    path: "/contact",
    keywords: [
      "contact cocktale",
      "cocktale support",
      "cocktail order help",
      "hello@cocktale.app",
    ],
  },
  terms: {
    title: "Terms of Use & Responsible Drinking Policy",
    description:
      "Cocktale terms of use covering accounts, personalized recommendations, market purchases, refunds, age limits, and responsible-drinking guidance.",
    path: "/terms",
    keywords: ["cocktale terms of use", "responsible drinking", "cocktail app terms"],
  },
  journey: {
    title: "Cocktail Tasting Journal & Collection Tracker",
    description:
      "Track every cocktail you've collected and tried, add tasting notes and dates, and watch your flavor profile shift over time in your own tasting journal.",
    path: "/journey",
    keywords: [
      "cocktail tasting journal",
      "cocktail tasting notes",
      "drinks I've tried tracker",
      "saved cocktail favorites",
      "personal mixology journal",
    ],
  },
  journal: {
    title: "Cocktail Tasting Journal",
    description:
      "Log cocktails you have tried with dates and tasting notes. Continues in your Cocktale journey journal.",
    path: "/journal",
    keywords: ["cocktail journal", "tasting notes"],
    index: false,
  },
  book: {
    title: "Collected Cocktail Book",
    description:
      "Your saved cocktail favorites — open them from your Cocktale journey collection.",
    path: "/book",
    keywords: ["saved cocktail recipes"],
    index: false,
  },
  orders: {
    title: "Your Cocktail Market Orders",
    description: "View Cocktale market order history for cocktail ingredients, glassware, and bar tools.",
    path: "/orders",
    keywords: ["cocktale orders"],
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

export function recipeTitle(name: string): string {
  const budget = 49 - name.length;
  if (budget >= 37) return `${name} Recipe: Ingredients & How to Make It`;
  if (budget >= 25) return `${name} Cocktail Recipe & Method`;
  if (budget >= 16) return `${name} Cocktail Recipe`;
  return `${name} Recipe`;
}

export function cocktailPageSeo(cocktail: Cocktail): PageSeo {
  const fallback = `How to make a ${cocktail.name}: exact measures, step-by-step method, glassware, flavor notes, and what to drink it with — plus where to buy the bottles.`;
  const custom = cocktail.description?.trim();
  const description =
    custom && custom.length >= 110 && custom.length <= 170
      ? custom
      : fallback;
  return {
    title: recipeTitle(cocktail.name),
    description,
    path: cocktailSeoPath(cocktail),
    keywords: [
      `${cocktail.name} recipe`,
      `${cocktail.name} cocktail recipe`,
      `how to make a ${cocktail.name}`,
      `${cocktail.name} ingredients`,
      `best ${cocktail.name} recipe`,
      cocktail.name,
      cocktail.glass,
      cocktail.category,
      ...cocktail.ingredients.slice(0, 5).map((i) => i.name),
      "classic cocktail recipes",
      "home bartender",
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
  const nameBudget = 49 - product.name.length;
  const title =
    nameBudget >= 26
      ? `${product.name} — Buy Online for Cocktails`
      : nameBudget >= 14
        ? `Buy ${product.name} Online`
        : product.name;
  return {
    title,
    description: `Buy ${product.name} on Cocktale — ${categoryLabel} for home bars, with local pricing and the cocktail recipes that use it. In stock and ready to ship.`,
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
    verification: {
      google: "WpbQm4GoCTxdzgBNFI0PYrCGCC-g80HtMHe5Kw-guFw",
    },
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
    question: "What cocktail should I drink tonight?",
    answer:
      "Pick by conditions, not a random list. Hot weather suits tall citrus drinks such as a Mojito or highball; cold weather suits stirred drinks such as an Old Fashioned, Manhattan, or Negroni. Cocktale ranks recipes from your local weather, mood, and tasting history.",
  },
  {
    question: "What is the most popular cocktail in the world?",
    answer:
      "It depends on ordered versus searched. The Margarita is the most-ordered drink in bars worldwide (Bacardi Cocktail Trends Report 2026). In US Google searches, the Old Fashioned leads at about 415,000 monthly queries, ahead of the Margarita and Espresso Martini.",
  },
  {
    question: "What are the basic cocktails every home bartender should know?",
    answer:
      "Old Fashioned, Martini, Daiquiri, Margarita, Whiskey Sour, and Negroni. Together they cover stirred-spirit, shaken-sour, and bitter-aperitif templates most other drinks riff on.",
  },
  {
    question: "What bar tools do I need at home?",
    answer:
      "A shaker, jigger, strainer, bar spoon, and citrus juicer cover most classic recipes. Measurement accuracy matters more than glassware when you are starting out. Shop those tools in the Cocktale market.",
  },
  {
    question: "Should I shake or stir a cocktail?",
    answer:
      "Stir drinks made only of spirits, such as a Martini or Manhattan, so they stay clear. Shake anything with juice, egg, or dairy so it chills and aerates properly.",
  },
  {
    question: "Can I buy ingredients and bar tools on Cocktale?",
    answer:
      "Yes. The market sells spirits, mixers, glassware, and bar tools linked to the recipes you want to make, with prices shown for Singapore, Hong Kong, Shanghai, New York, Paris, and Tokyo.",
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
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.png"),
          width: 512,
          height: 512,
        },
        description: SITE_TAGLINE,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@cocktale.app",
          availableLanguage: ["English"],
          areaServed: ["SG", "HK", "CN", "US", "FR", "JP"],
        },
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
    recipeYield: "1 serving",
    prepTime: "PT5M",
    totalTime: "PT8M",
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

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: PAGE_SEO.contact.title,
    description: PAGE_SEO.contact.description,
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      email: "hello@cocktale.app",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: "+65-9131-9481",
        email: "hello@cocktale.app",
        availableLanguage: ["English"],
      },
    },
  };
}

export function collectionPageJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
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
