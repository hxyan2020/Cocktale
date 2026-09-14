import type { Cocktail } from "@/lib/types";
import type { PageSeo } from "@/lib/seo";

export type CocktailHub = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  intro: string;
  match: (cocktail: Cocktail) => boolean;
};

function ingredientBlob(cocktail: Cocktail) {
  return cocktail.ingredients.map((i) => i.name).join(" ").toLowerCase();
}

export const COCKTAIL_HUBS: CocktailHub[] = [
  {
    slug: "gin",
    title: "Gin Cocktails & Classic Gin Recipes",
    h1: "Gin cocktails, from the Martini to the Negroni",
    description:
      "Browse gin cocktail recipes — Martini, Negroni, Gin & Tonic riffs, Collins, and modern gin drinks with ingredients, steps, and glassware.",
    keywords: [
      "gin cocktails",
      "gin cocktail recipes",
      "best gin cocktails",
      "negroni recipe",
      "martini recipe",
      "easy gin drinks",
    ],
    intro:
      "Gin is the backbone of the Martini, Negroni, and a long list of citrus-forward highballs. These recipes use gin or genever as a base spirit — search by name, then open the full method.",
    match: (c) => /\bgin\b|genever/.test(ingredientBlob(c)),
  },
  {
    slug: "whiskey",
    title: "Whiskey Cocktails: Old Fashioned, Manhattan & More",
    h1: "Whiskey cocktails for home bartenders",
    description:
      "Whiskey, bourbon, rye, and Scotch cocktail recipes — Old Fashioned, Manhattan, Whiskey Sour, and more with exact measures and steps.",
    keywords: [
      "whiskey cocktails",
      "bourbon cocktails",
      "old fashioned recipe",
      "manhattan cocktail recipe",
      "whiskey sour recipe",
      "easy whiskey drinks",
    ],
    intro:
      "US search data puts the Old Fashioned at the top of cocktail queries. These recipes use whiskey, bourbon, rye, or Scotch — spirit-forward stirred drinks and sours alike.",
    match: (c) => /\b(whiskey|whisky|bourbon|rye|scotch)\b/.test(ingredientBlob(c)),
  },
  {
    slug: "vodka",
    title: "Vodka Cocktails: Espresso Martini, Mule & More",
    h1: "Vodka cocktail recipes",
    description:
      "Vodka cocktail recipes including Espresso Martini, Moscow Mule, Cosmopolitan, and White Russian — ingredients, method, and glassware.",
    keywords: [
      "vodka cocktails",
      "vodka cocktail recipes",
      "espresso martini recipe",
      "moscow mule recipe",
      "easy vodka drinks",
    ],
    intro:
      "The Espresso Martini is one of the most-searched cocktails in the US and UK. These drinks use vodka as the base — from espresso nightcaps to ginger-beer highballs.",
    match: (c) => /\bvodka\b/.test(ingredientBlob(c)),
  },
  {
    slug: "rum",
    title: "Rum Cocktails: Mojito, Daiquiri & Piña Colada",
    h1: "Rum cocktail recipes",
    description:
      "Rum cocktail recipes — Mojito, Daiquiri, Piña Colada, and tiki classics with ingredients, steps, and the right glass.",
    keywords: [
      "rum cocktails",
      "mojito recipe",
      "daiquiri recipe",
      "pina colada recipe",
      "easy rum drinks",
      "tiki cocktails",
    ],
    intro:
      "Rum covers the world’s most-ordered refreshing drinks: Mojito, Daiquiri, and Piña Colada. White, gold, and dark rum recipes are grouped here.",
    match: (c) => /\brum\b|cacha[cç]a/.test(ingredientBlob(c)),
  },
  {
    slug: "tequila",
    title: "Tequila & Mezcal Cocktails: Margarita & Paloma",
    h1: "Tequila and mezcal cocktail recipes",
    description:
      "Tequila and mezcal cocktail recipes — Margarita, Paloma, and agave-forward drinks with ingredients, steps, and glassware.",
    keywords: [
      "tequila cocktails",
      "margarita recipe",
      "paloma cocktail",
      "mezcal cocktails",
      "easy tequila drinks",
    ],
    intro:
      "The Margarita is the most-ordered cocktail in bars worldwide (Bacardi Cocktail Trends Report 2026) and a top US Google query. These recipes use tequila or mezcal.",
    match: (c) => /\b(tequila|mezcal)\b/.test(ingredientBlob(c)),
  },
  {
    slug: "hot-weather",
    title: "Hot Weather Cocktails & Summer Highballs",
    h1: "Cocktails for hot weather",
    description:
      "Refreshing cocktails for hot days — tall highballs, citrus sours, and tropical drinks ranked for warm and humid weather.",
    keywords: [
      "hot weather cocktails",
      "summer cocktails",
      "refreshing cocktails",
      "best summer drinks",
      "highball cocktails",
    ],
    intro:
      "When it is hot out, shaken citrus drinks and tall highballs beat spirit-forward nightcaps. These recipes are tagged for hot or warm weather on Cocktale.",
    match: (c) => c.weatherAffinity.some((w) => w === "hot" || w === "warm"),
  },
  {
    slug: "cold-weather",
    title: "Cold Weather Cocktails & Cozy Nightcaps",
    h1: "Cocktails for cold weather",
    description:
      "Cozy cold-weather cocktails — Old Fashioned, Manhattan, espresso drinks, and stirred nightcaps for cool, cold, or rainy nights.",
    keywords: [
      "cold weather cocktails",
      "winter cocktails",
      "cozy cocktails",
      "rainy day cocktails",
      "nightcap cocktails",
    ],
    intro:
      "Cold and rainy nights favor stirred whiskey drinks and espresso nightcaps. These recipes are tagged for cool, cold, or rainy weather.",
    match: (c) => c.weatherAffinity.some((w) => w === "cold" || w === "cool" || w === "rainy"),
  },
  {
    slug: "3-ingredient",
    title: "Easy 3-Ingredient Cocktail Recipes",
    h1: "Easy 3-ingredient cocktails",
    description:
      "Simple cocktail recipes with three ingredients or fewer — classics you can make tonight without a full back bar.",
    keywords: [
      "3 ingredient cocktails",
      "easy cocktail recipes",
      "simple cocktails",
      "2 ingredient cocktails",
      "easy drinks to make at home",
    ],
    intro:
      "Most classics are short: a Daiquiri is three ingredients, a Negroni is three. These recipes use three measured ingredients or fewer — a practical starting bar.",
    match: (c) => c.ingredients.filter((i) => i.name.trim()).length <= 3,
  },
];

export function getCocktailHub(slug: string): CocktailHub | undefined {
  return COCKTAIL_HUBS.find((hub) => hub.slug === slug);
}

export function cocktailsForHub(hub: CocktailHub, all: Cocktail[]): Cocktail[] {
  return all.filter(hub.match).sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
}

export function hubsForCocktail(cocktail: Cocktail): CocktailHub[] {
  return COCKTAIL_HUBS.filter((hub) => hub.match(cocktail));
}

export function cocktailHubSeo(hub: CocktailHub): PageSeo {
  return {
    title: hub.title,
    description: hub.description,
    path: `/cocktails/${hub.slug}`,
    keywords: hub.keywords,
  };
}
