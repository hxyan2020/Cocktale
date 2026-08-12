import type { Cocktail } from "@/lib/types";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  label: string;
  unoptimized?: boolean;
};

/** Curated cocktail / bar photography (Unsplash) used as complementary angles. */
const STOCK_COCKTAIL_SHOTS = [
  {
    url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80",
    label: "Bar pour",
  },
  {
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
    label: "Fresh citrus",
  },
  {
    url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80",
    label: "On the rocks",
  },
  {
    url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
    label: "Evening serve",
  },
  {
    url: "https://images.unsplash.com/photo-1587223962930-cb7f313ff742?auto=format&fit=crop&w=900&q=80",
    label: "Garnish close-up",
  },
  {
    url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=80",
    label: "Shaker & tools",
  },
  {
    url: "https://images.unsplash.com/photo-1551538827-9c03746530ea?auto=format&fit=crop&w=900&q=80",
    label: "Glassware",
  },
  {
    url: "https://images.unsplash.com/photo-1575023782549-fea7c3d5b0d4?auto=format&fit=crop&w=900&q=80",
    label: "Ice & chill",
  },
  {
    url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80",
    label: "Citrus prep",
  },
  {
    url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    label: "Table setting",
  },
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function ingredientImageUrl(name: string) {
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}.png`;
}

/**
 * Build 4–6 additional gallery images for a cocktail card
 * (beyond the primary hero thumb already shown).
 */
export function getCocktailGallery(cocktail: Cocktail, count = 5): GalleryImage[] {
  const target = Math.min(6, Math.max(4, count));
  const out: GalleryImage[] = [];
  const seen = new Set<string>();

  const push = (img: GalleryImage) => {
    if (seen.has(img.url) || out.length >= target) return;
    seen.add(img.url);
    out.push(img);
  };

  // 1) Alternate finished-drink framing of the same cocktail photo
  if (cocktail.image) {
    push({
      id: `${cocktail.id}-finished`,
      url: cocktail.image,
      alt: `${cocktail.name} finished pour`,
      label: "Finished pour",
    });
  }

  // 2–5) Ingredient stills (how it comes together)
  for (const ing of cocktail.ingredients.slice(0, 4)) {
    push({
      id: `${cocktail.id}-ing-${ing.name}`,
      url: ingredientImageUrl(ing.name),
      alt: `${ing.name} for ${cocktail.name}`,
      label: ing.name,
    });
  }

  // Fill remaining with curated cocktail/bar shots, deterministic per cocktail
  const start = hashSeed(cocktail.id + cocktail.name) % STOCK_COCKTAIL_SHOTS.length;
  for (let i = 0; i < STOCK_COCKTAIL_SHOTS.length && out.length < target; i++) {
    const shot = STOCK_COCKTAIL_SHOTS[(start + i) % STOCK_COCKTAIL_SHOTS.length];
    push({
      id: `${cocktail.id}-stock-${i}`,
      url: shot.url,
      alt: `${cocktail.name} — ${shot.label}`,
      label: shot.label,
    });
  }

  return out.slice(0, target);
}
