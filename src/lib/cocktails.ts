import cocktailsData from "@/data/cocktails.json";
import type { Cocktail } from "@/lib/types";

export const cocktails = cocktailsData as Cocktail[];

const byId = new Map(cocktails.map((c) => [c.id, c]));

export function getCocktail(id: string): Cocktail | undefined {
  return byId.get(id);
}

export function getAllCocktails(): Cocktail[] {
  return cocktails;
}

export function searchCocktails(query: string, category?: string): Cocktail[] {
  const q = query.trim().toLowerCase();
  const cat = category && category !== "all" ? category : null;
  return cocktails.filter((c) => {
    if (cat && c.category !== cat) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.alternateName && c.alternateName.toLowerCase().includes(q)) ||
      c.origin.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.glass.toLowerCase().includes(q) ||
      c.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
      c.moods.some((m) => m.toLowerCase().includes(q)) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.flavorProfile.some((f) => f.toLowerCase().includes(q))
    );
  });
}

export function cocktailCategories(): string[] {
  return [...new Set(cocktails.map((c) => c.category))].sort((a, b) => a.localeCompare(b));
}
