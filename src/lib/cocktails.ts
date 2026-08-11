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

export function searchCocktails(query: string): Cocktail[] {
  const q = query.trim().toLowerCase();
  if (!q) return cocktails;
  return cocktails.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.origin.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
      c.moods.some((m) => m.includes(q)),
  );
}
