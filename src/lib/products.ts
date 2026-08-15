import productsData from "@/data/products.json";
import type { Product } from "@/lib/commerce-types";

const rawProducts = productsData as Product[];

// Ingredient and glass names from CocktailDB can differ only by capitalization,
// producing duplicate product IDs. Keep one canonical card per purchasable item.
export const products = [...new Map(rawProducts.map((product) => [product.id, product])).values()];

const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function productImageClass(url: string, kind: "card" | "hero" | "thumb" = "card") {
  const packShot = url.includes("thecocktaildb.com/images/ingredients");
  if (packShot) {
    if (kind === "thumb") return "object-contain bg-[#f3efe6] p-1";
    if (kind === "hero") return "object-contain p-6";
    return "object-contain bg-[#f3efe6] p-4";
  }
  return "object-cover";
}

export function productImageUnoptimized(url: string) {
  return url.includes("commons.wikimedia.org") || url.includes("upload.wikimedia.org");
}

export function equipmentImageUrl(sourceKey: string): string | undefined {
  const product = products.find(
    (product) =>
      product.sourceKey === sourceKey &&
      (product.category === "utensil" || product.category === "accessory"),
  );
  return product?.images[0]?.url ? `/utensils/${sourceKey}.webp` : undefined;
}

export function formatMoney(cents: number, currency = "usd", locale = "en") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function searchProducts(query: string, category?: string): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function productsForCocktailIngredients(
  ingredientNames: string[],
  glass?: string,
  equipmentIds?: string[],
): Product[] {
  const set = new Set<string>();
  const out: Product[] = [];
  for (const name of ingredientNames) {
    const p = products.find(
      (x) => x.category === "ingredient" && x.sourceKey.toLowerCase() === name.toLowerCase(),
    );
    if (p && !set.has(p.id)) {
      set.add(p.id);
      out.push(p);
    }
  }
  if (glass) {
    const g = products.find(
      (x) => x.category === "glassware" && x.sourceKey.toLowerCase() === glass.toLowerCase(),
    );
    if (g && !set.has(g.id)) {
      set.add(g.id);
      out.push(g);
    }
  }
  for (const id of equipmentIds || []) {
    const t = products.find((x) => x.id === `tool-${id}`);
    if (t && !set.has(t.id)) {
      set.add(t.id);
      out.push(t);
    }
  }
  return out;
}
