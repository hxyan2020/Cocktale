/**
 * Build marketplace catalog from cocktail ingredients, glassware, and bar tools.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Cocktail } from "../src/lib/types";

type ProductImage = {
  angle: "hero" | "front" | "side" | "detail" | "packaging" | "lifestyle";
  url: string;
  alt: string;
};

export type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  category: "ingredient" | "utensil" | "accessory" | "glassware";
  subcategory: string;
  priceCents: number;
  currency: "usd";
  description: string;
  longDescription: string;
  specs: { label: string; value: string }[];
  images: ProductImage[];
  stock: number;
  unit: string;
  brand: string;
  tags: string[];
  relatedCocktailIds: string[];
  sourceKey: string;
};

const EQUIPMENT_META: Record<
  string,
  { name: string; subcategory: string; priceCents: number; unit: string; brand: string; specs: { label: string; value: string }[]; description: string; longDescription: string }
> = {
  jigger: {
    name: "Japanese-Style Jigger",
    subcategory: "Measuring",
    priceCents: 1899,
    unit: "1 piece",
    brand: "BarForge",
    description: "Dual-sided stainless jigger for precise cocktail measuring.",
    longDescription:
      "A balanced 1 oz / 2 oz jigger with internal etch marks at 0.5 oz and 1.5 oz. Weighted base resists tipping on busy bar tops. Dishwasher-safe food-grade stainless steel.",
    specs: [
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Capacities", value: "1 oz / 2 oz (30 / 60 ml)" },
      { label: "Finish", value: "Brushed mirror" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  cocktailShaker: {
    name: "Weighted Cocktail Shaker Set",
    subcategory: "Mixing",
    priceCents: 3499,
    unit: "2-piece set",
    brand: "BarForge",
    description: "Boston-style tin-on-tin shaker for confident, leak-resistant shakes.",
    longDescription:
      "Professional weighted tins (28 oz & 18 oz) that seal tightly under pressure and release cleanly. Ideal for sours, daiquiris, and egg-white drinks.",
    specs: [
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Sizes", value: "28 oz + 18 oz" },
      { label: "Style", value: "Boston / tin-on-tin" },
      { label: "Weight", value: "Weighted base" },
    ],
  },
  mixingGlass: {
    name: "Japanese Mixing Glass",
    subcategory: "Mixing",
    priceCents: 4299,
    unit: "1 piece",
    brand: "ClearCraft",
    description: "Seamless crystal mixing glass for stirred classics.",
    longDescription:
      "Heavy-bottomed mixing glass with a wide mouth for easy stirring and straining. Crystal-clear walls show dilution as you work—perfect for Martinis and Manhattans.",
    specs: [
      { label: "Material", value: "Soda-lime crystal glass" },
      { label: "Capacity", value: "750 ml" },
      { label: "Mouth", value: "Wide pour spout" },
      { label: "Care", value: "Hand wash recommended" },
    ],
  },
  barSpoon: {
    name: "Twisted Bar Spoon",
    subcategory: "Mixing",
    priceCents: 1299,
    unit: "1 piece",
    brand: "BarForge",
    description: "Long twisted spoon for layered stirring and elegant builds.",
    longDescription:
      "40 cm twisted shaft reduces turbulence while stirring. Teardrop weight on the end doubles as a muddling assist for soft fruit.",
    specs: [
      { label: "Length", value: "40 cm / 15.7 in" },
      { label: "Material", value: "Stainless steel" },
      { label: "Tip", value: "Teardrop weight" },
      { label: "Dishwasher", value: "Safe" },
    ],
  },
  hawthorneStrainer: {
    name: "Hawthorne Strainer",
    subcategory: "Straining",
    priceCents: 1499,
    unit: "1 piece",
    brand: "BarForge",
    description: "Spring-coil strainer that fits shakers and mixing glasses.",
    longDescription:
      "Tight coil keeps ice and muddled solids in the tin while you pour. Two prongs stabilize on most tin rims.",
    specs: [
      { label: "Fit", value: "Standard Boston tins" },
      { label: "Coil", value: "Replaceable spring" },
      { label: "Material", value: "Stainless steel" },
    ],
  },
  fineStrainer: {
    name: "Fine-Mesh Cocktail Strainer",
    subcategory: "Straining",
    priceCents: 1199,
    unit: "1 piece",
    brand: "ClearCraft",
    description: "Cone fine strainer for double-straining silky textures.",
    longDescription:
      "Ultra-fine mesh catches ice chips and citrus pulp—essential for egg-white foam and crystal-clear shaken drinks.",
    specs: [
      { label: "Mesh", value: "Fine stainless" },
      { label: "Handle", value: "Heat-safe grip" },
      { label: "Diameter", value: "8 cm" },
    ],
  },
  muddler: {
    name: "Hardwood Muddler",
    subcategory: "Prep",
    priceCents: 1699,
    unit: "1 piece",
    brand: "GroveBar",
    description: "Beechwood muddler for mint, citrus, and sugar cubes.",
    longDescription:
      "Flat-tooth head crushes without shredding herbs into bitterness. Sealed finish resists staining from berries and bitters.",
    specs: [
      { label: "Material", value: "Beechwood" },
      { label: "Length", value: "20 cm" },
      { label: "Head", value: "Tooth-pattern flat" },
      { label: "Care", value: "Hand wash, oil monthly" },
    ],
  },
  citrusJuicer: {
    name: "Hand Citrus Press",
    subcategory: "Prep",
    priceCents: 2299,
    unit: "1 piece",
    brand: "GroveBar",
    description: "Leverage press for lemons, limes, and small oranges.",
    longDescription:
      "Cast aluminum press extracts juice with minimal pith bitterness. Removable strainer cup catches seeds.",
    specs: [
      { label: "Material", value: "Cast aluminum" },
      { label: "Finish", value: "Powder-coated" },
      { label: "Includes", value: "Seed strainer cup" },
    ],
  },
  knifeAndBoard: {
    name: "Garnish Knife & Board Set",
    subcategory: "Prep",
    priceCents: 2799,
    unit: "2-piece set",
    brand: "GroveBar",
    description: "Compact pairing knife with juice-groove cutting board.",
    longDescription:
      "Sharp pairing knife and non-slip board sized for citrus wheels, twists, and pineapple spears—without monopolizing counter space.",
    specs: [
      { label: "Blade", value: "High-carbon stainless, 9 cm" },
      { label: "Board", value: "Rubberwood with juice groove" },
      { label: "Set", value: "Knife + board" },
    ],
  },
  peeler: {
    name: "Y-Peeler for Twists",
    subcategory: "Prep",
    priceCents: 999,
    unit: "1 piece",
    brand: "GroveBar",
    description: "Ultra-sharp Y-peeler for wide citrus twists.",
    longDescription:
      "Carbon-steel blade glides under zest with minimal pith—ideal for elegant garnish twists and oleo prep.",
    specs: [
      { label: "Blade", value: "Carbon steel" },
      { label: "Handle", value: "Non-slip grip" },
      { label: "Style", value: "Y-peeler" },
    ],
  },
  blender: {
    name: "Bar Blender 1000W",
    subcategory: "Mixing",
    priceCents: 8999,
    unit: "1 unit",
    brand: "PulseBar",
    description: "High-power blender for frozen cocktails and purées.",
    longDescription:
      "1000W motor pulverizes ice for coladas and frozen margaritas. BPA-free jar with pulse and crush settings.",
    specs: [
      { label: "Power", value: "1000W" },
      { label: "Jar", value: "1.5 L BPA-free" },
      { label: "Programs", value: "Pulse / Ice crush / Smoothie" },
    ],
  },
  ice: {
    name: "Crystal Clear Ice Cubes (2 kg)",
    subcategory: "Ice",
    priceCents: 1299,
    unit: "2 kg bag",
    brand: "NorthFreeze",
    description: "Dense, clear cubes that melt slower in spirit-forward drinks.",
    longDescription:
      "Directional-frozen ice with fewer bubbles—keeps Old Fashioneds cold without watering them down too fast. Ships frozen with insulated liner.",
    specs: [
      { label: "Cube size", value: "5 cm large cubes" },
      { label: "Weight", value: "2 kg" },
      { label: "Storage", value: "Keep frozen" },
    ],
  },
  iceScoop: {
    name: "Aluminum Ice Scoop",
    subcategory: "Ice",
    priceCents: 1099,
    unit: "1 piece",
    brand: "BarForge",
    description: "Food-safe scoop sized for home ice bins.",
    longDescription:
      "One-piece aluminum scoop with comfortable grip—never use the glass itself as a scoop again.",
    specs: [
      { label: "Capacity", value: "12 oz" },
      { label: "Material", value: "Aluminum" },
      { label: "Edge", value: "Rounded safety rim" },
    ],
  },
  teaspoon: {
    name: "Bar Teaspoon Set",
    subcategory: "Measuring",
    priceCents: 899,
    unit: "2-piece set",
    brand: "BarForge",
    description: "Precision teaspoons for syrups, bitters top-ups, and hot toddies.",
    longDescription:
      "Marked 2.5 ml / 5 ml spoons for recipes that call for ‘a spoonful’ without guessing.",
    specs: [
      { label: "Sizes", value: "½ tsp / 1 tsp" },
      { label: "Material", value: "Stainless steel" },
    ],
  },
  kettleOrHeat: {
    name: "Gooseneck Electric Kettle",
    subcategory: "Heat",
    priceCents: 5499,
    unit: "1 unit",
    brand: "PulseBar",
    description: "Variable-temp kettle for toddies, Irish coffee, and tea infusions.",
    longDescription:
      "Hold temperatures from 40–100°C with a precision gooseneck spout for controlled pours over sugar and spirits.",
    specs: [
      { label: "Capacity", value: "0.9 L" },
      { label: "Temp range", value: "40–100°C" },
      { label: "Base", value: "360° cordless" },
    ],
  },
  punchBowl: {
    name: "Glass Punch Bowl (4 L)",
    subcategory: "Service",
    priceCents: 4599,
    unit: "1 piece",
    brand: "ClearCraft",
    description: "Party-ready punch bowl with wide ladle clearance.",
    longDescription:
      "Four-liter crystal-look bowl for batch cocktails and festive service. Stable footed base for buffet tables.",
    specs: [
      { label: "Capacity", value: "4 L" },
      { label: "Material", value: "Tempered glass" },
      { label: "Diameter", value: "28 cm" },
    ],
  },
  ladle: {
    name: "Punch Ladle",
    subcategory: "Service",
    priceCents: 1499,
    unit: "1 piece",
    brand: "ClearCraft",
    description: "Deep ladle for bowls and batched cocktails.",
    longDescription:
      "Long handle keeps knuckles clear of ice water. 90 ml bowl pours neatly into cups.",
    specs: [
      { label: "Bowl", value: "90 ml" },
      { label: "Length", value: "33 cm" },
      { label: "Material", value: "Stainless steel" },
    ],
  },
  coffeeMaker: {
    name: "Compact Espresso Maker",
    subcategory: "Heat",
    priceCents: 12999,
    unit: "1 unit",
    brand: "PulseBar",
    description: "Home espresso machine for Espresso Martinis and coffee cocktails.",
    longDescription:
      "15-bar pump, milk frother, and single/double shot baskets—built for cocktail bars that start with real espresso.",
    specs: [
      { label: "Pressure", value: "15 bar" },
      { label: "Water tank", value: "1.2 L" },
      { label: "Frother", value: "Steam wand" },
    ],
  },
  whiskOrFrother: {
    name: "Handheld Milk Frother",
    subcategory: "Prep",
    priceCents: 1599,
    unit: "1 piece",
    brand: "PulseBar",
    description: "Battery frother for cream tops and silky textures.",
    longDescription:
      "USB-rechargeable frother whips cream and aquafaba quickly for dessert cocktails and foam garnishes.",
    specs: [
      { label: "Power", value: "USB-C rechargeable" },
      { label: "Speeds", value: "2" },
      { label: "Shaft", value: "Stainless whisk" },
    ],
  },
  grater: {
    name: "Microplane Zester",
    subcategory: "Prep",
    priceCents: 1799,
    unit: "1 piece",
    brand: "GroveBar",
    description: "Razor-fine grater for nutmeg, citrus zest, and chocolate.",
    longDescription:
      "Etched blade produces fluffy zest and spice snow without bitter pith—finishing tool for eggnog and espresso drinks.",
    specs: [
      { label: "Blade", value: "Etched stainless" },
      { label: "Cover", value: "Protective sheath included" },
      { label: "Dishwasher", value: "Top rack" },
    ],
  },
  channelKnife: {
    name: "Channel Knife & Zester",
    subcategory: "Prep",
    priceCents: 1399,
    unit: "1 piece",
    brand: "GroveBar",
    description: "Cut long citrus channels for classic twists.",
    longDescription:
      "Dual-head tool: channel knife for spirals and a small zester for grated aromatics over the finished drink.",
    specs: [
      { label: "Heads", value: "Channel + zester" },
      { label: "Material", value: "Stainless / resin handle" },
    ],
  },
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function hashPrice(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const span = max - min;
  // round to .99 style cents ending
  const base = min + (h % (span + 1));
  return Math.floor(base / 100) * 100 + 99;
}

function classifyIngredient(name: string) {
  const n = name.toLowerCase();
  if (/vodka|gin|rum|tequila|mezcal|whiskey|whisky|bourbon|rye|scotch|brandy|cognac|pisco|cachaca|absinthe|aquavit/.test(n))
    return { subcategory: "Spirit", min: 2499, max: 6499, unit: "750 ml bottle" };
  if (/liqueur|triple sec|curaçao|curacao|amaretto|kahlua|baileys|chartreuse|campari|aperol|vermouth|amaro|schnapps|creme de|cream of|maraschino|benedictine|grand marnier|cointreau/.test(n))
    return { subcategory: "Liqueur / Aperitif", min: 1699, max: 4299, unit: "750 ml bottle" };
  if (/wine|champagne|prosecco|cava|sherry|port|sparkling/.test(n))
    return { subcategory: "Wine & Sparkling", min: 1499, max: 4999, unit: "750 ml bottle" };
  if (/beer|ale|stout|lager|cider/.test(n))
    return { subcategory: "Beer & Cider", min: 799, max: 1599, unit: "4-pack" };
  if (/bitters/.test(n))
    return { subcategory: "Bitters", min: 1299, max: 2499, unit: "5 oz bottle" };
  if (/syrup|honey|sugar|grenadine|orgeat|falernum/.test(n))
    return { subcategory: "Syrup & Sweetener", min: 799, max: 1699, unit: "12 oz bottle" };
  if (/juice|purée|puree|nectar|lemonade/.test(n))
    return { subcategory: "Juice & Mixer", min: 399, max: 999, unit: "1 L carton" };
  if (/soda|tonic|cola|ginger beer|ginger ale|club soda|sparkling water|energy/.test(n))
    return { subcategory: "Soda & Mixer", min: 399, max: 899, unit: "4 × 200 ml" };
  if (/mint|basil|lime|lemon|orange|berry|fruit|cucumber|ginger|pineapple|cherry|olive|celery|apple|peach|banana|coconut|egg|cream|milk|coffee|espresso|tea|chocolate|cinnamon|nutmeg|salt|pepper|spice/.test(n))
    return { subcategory: "Fresh & Garnish", min: 299, max: 899, unit: "Pack" };
  return { subcategory: "Bar Ingredient", min: 699, max: 1999, unit: "Bottle / pack" };
}

function ingredientImages(name: string, slug: string): ProductImage[] {
  const encoded = encodeURIComponent(name);
  const hero = `https://www.thecocktaildb.com/images/ingredients/${encoded}.png`;
  const angles: ProductImage["angle"][] = ["hero", "front", "side", "detail", "packaging"];
  return angles.map((angle, i) => ({
    angle,
    url:
      i === 0
        ? hero
        : `/api/product-image?name=${encodeURIComponent(name)}&angle=${angle}&seed=${encodeURIComponent(slug)}`,
    alt: `${name} — ${angle} view`,
  }));
}

function toolImages(name: string, slug: string): ProductImage[] {
  const angles: ProductImage["angle"][] = ["hero", "front", "side", "detail", "lifestyle"];
  return angles.map((angle) => ({
    angle,
    url: `/api/product-image?name=${encodeURIComponent(name)}&angle=${angle}&seed=${encodeURIComponent(slug)}&kind=tool`,
    alt: `${name} — ${angle} view`,
  }));
}

function glassImages(name: string, slug: string): ProductImage[] {
  const angles: ProductImage["angle"][] = ["hero", "front", "side", "detail", "lifestyle"];
  return angles.map((angle) => ({
    angle,
    url: `/api/product-image?name=${encodeURIComponent(name)}&angle=${angle}&seed=${encodeURIComponent(slug)}&kind=glass`,
    alt: `${name} — ${angle} view`,
  }));
}

function main() {
  const cocktails = JSON.parse(
    readFileSync(join(process.cwd(), "src/data/cocktails.json"), "utf8"),
  ) as Cocktail[];

  const ingredientMap = new Map<string, Set<string>>();
  const glassMap = new Map<string, Set<string>>();

  for (const c of cocktails) {
    for (const ing of c.ingredients) {
      const key = ing.name.trim();
      if (!key) continue;
      if (!ingredientMap.has(key)) ingredientMap.set(key, new Set());
      ingredientMap.get(key)!.add(c.id);
    }
    const glass = (c.glass || "").trim();
    if (glass) {
      if (!glassMap.has(glass)) glassMap.set(glass, new Set());
      glassMap.get(glass)!.add(c.id);
    }
  }

  const products: SeedProduct[] = [];

  for (const [name, cocktailIds] of [...ingredientMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const cls = classifyIngredient(name);
    const slug = slugify(name);
    const priceCents = hashPrice(name, cls.min, cls.max);
    const related = [...cocktailIds].slice(0, 12);
    products.push({
      id: `ing-${slug}`,
      slug: `ingredient-${slug}`,
      name,
      category: "ingredient",
      subcategory: cls.subcategory,
      priceCents,
      currency: "usd",
      description: `${name} for home bartending—bottled and ready for the recipes in Cocktale.`,
      longDescription: `${name} is stocked for the cocktails that call for it across our library. Suitable for ${cls.subcategory.toLowerCase()} builds. Store sealed in a cool cupboard (or chilled if fresh). Ships with protective packaging.`,
      specs: [
        { label: "Product type", value: cls.subcategory },
        { label: "Unit", value: cls.unit },
        { label: "Origin style", value: "Bar pantry staple" },
        { label: "Best for", value: `${related.length}+ Cocktale recipes` },
        { label: "Shelf life", value: cls.subcategory.includes("Fresh") ? "Use within 7 days" : "12–36 months sealed" },
        { label: "Allergens", value: /egg|milk|cream|nut|almond|dairy/i.test(name) ? "See label — may contain allergens" : "See bottle label" },
      ],
      images: ingredientImages(name, slug),
      stock: 20 + (name.length % 40),
      unit: cls.unit,
      brand: "Cocktale Pantry",
      tags: [cls.subcategory, "ingredient"],
      relatedCocktailIds: related,
      sourceKey: name,
    });
  }

  for (const [glass, cocktailIds] of [...glassMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const slug = slugify(glass);
    const priceCents = hashPrice(glass, 1299, 3499);
    products.push({
      id: `glass-${slug}`,
      slug: `glass-${slug}`,
      name: glass,
      category: "glassware",
      subcategory: "Glassware",
      priceCents,
      currency: "usd",
      description: `Serve authentic pours in a proper ${glass}.`,
      longDescription: `This ${glass} matches the glassware called for across Cocktale recipes. Clear walls, balanced stem or base, and dishwasher-safe construction for weeknight entertaining.`,
      specs: [
        { label: "Type", value: glass },
        { label: "Material", value: "Crystal-clear glass" },
        { label: "Set", value: "Sold individually" },
        { label: "Care", value: "Dishwasher safe (top rack)" },
        { label: "Used in", value: `${cocktailIds.size} recipes` },
      ],
      images: glassImages(glass, slug),
      stock: 35,
      unit: "1 glass",
      brand: "ClearCraft",
      tags: ["glassware", glass],
      relatedCocktailIds: [...cocktailIds].slice(0, 12),
      sourceKey: glass,
    });
  }

  for (const [id, meta] of Object.entries(EQUIPMENT_META)) {
    const slug = slugify(meta.name);
    products.push({
      id: `tool-${id}`,
      slug: `tool-${slug}`,
      name: meta.name,
      category: id === "ice" ? "accessory" : "utensil",
      subcategory: meta.subcategory,
      priceCents: meta.priceCents,
      currency: "usd",
      description: meta.description,
      longDescription: meta.longDescription,
      specs: meta.specs,
      images: toolImages(meta.name, slug),
      stock: 50,
      unit: meta.unit,
      brand: meta.brand,
      tags: ["utensil", meta.subcategory, id],
      relatedCocktailIds: [],
      sourceKey: id,
    });
  }

  // Accessories bundle
  products.push({
    id: "acc-coaster-set",
    slug: "accessory-stone-coaster-set",
    name: "Stone Coaster Set (4)",
    category: "accessory",
    subcategory: "Service",
    priceCents: 2499,
    currency: "usd",
    description: "Absorbent stone coasters to protect tables from condensation rings.",
    longDescription:
      "Four cork-backed stone coasters with a soft matte face—pairs with any glassware in the marketplace.",
    specs: [
      { label: "Pack", value: "4 coasters" },
      { label: "Material", value: "Ceramic stone + cork" },
      { label: "Diameter", value: "10 cm" },
    ],
    images: toolImages("Stone Coaster Set", "stone-coaster-set"),
    stock: 80,
    unit: "4-pack",
    brand: "ClearCraft",
    tags: ["accessory", "coaster"],
    relatedCocktailIds: [],
    sourceKey: "coaster-set",
  });

  products.sort((a, b) => a.name.localeCompare(b.name));

  const outDir = join(process.cwd(), "src/data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "products.json"), JSON.stringify(products, null, 2));
  writeFileSync(
    join(outDir, "products-meta.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: products.length,
        byCategory: products.reduce(
          (acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${products.length} products`);
}

main();
