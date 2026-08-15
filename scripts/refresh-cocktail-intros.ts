import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { descriptionForCocktail, storyForCocktail } from "./cocktail-intros";

type CocktailRecord = {
  name: string;
  category: string;
  glass: string;
  origin: string;
  alcoholic: boolean;
  description: string;
  story: string;
  ingredients: { name: string }[];
  flavorProfile: string[];
};

const dataPath = join(process.cwd(), "src", "data", "cocktails.json");
const cocktails = JSON.parse(readFileSync(dataPath, "utf8")) as CocktailRecord[];
let refreshedStories = 0;

for (const cocktail of cocktails) {
  const input = {
    name: cocktail.name,
    category: cocktail.category,
    glass: cocktail.glass,
    origin: cocktail.origin,
    alcoholic: cocktail.alcoholic,
    ingredients: cocktail.ingredients.map((ingredient) => ingredient.name),
    flavors: cocktail.flavorProfile,
  };

  cocktail.description = descriptionForCocktail(input);

  if (
    cocktail.story.startsWith("Part of the living ") &&
    cocktail.story.endsWith(
      "Home bartenders keep reinventing it—ratios stay familiar, proportions tell the tale.",
    )
  ) {
    cocktail.story = storyForCocktail(input);
    refreshedStories += 1;
  }
}

writeFileSync(dataPath, `${JSON.stringify(cocktails, null, 2)}\n`);
console.log(`Refreshed ${cocktails.length} descriptions and ${refreshedStories} generic stories.`);
