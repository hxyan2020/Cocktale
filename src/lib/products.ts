import productsData from "@/data/products.json";
import type { Product } from "@/lib/commerce-types";

export const products = productsData as Product[];

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
