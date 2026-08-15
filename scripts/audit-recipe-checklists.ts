import cocktails from "../src/data/cocktails.json";
import {
  inferEquipment,
  preparationChecklistSteps,
  type EquipmentId,
} from "../src/lib/make-guide";
import type { Cocktail } from "../src/lib/types";

type Failure = {
  id: string;
  name: string;
  issue: string;
};

const failures: Failure[] = [];

for (const raw of cocktails) {
  const cocktail = raw as Cocktail;
  const equipment = inferEquipment(cocktail);
  const steps = preparationChecklistSteps(
    cocktail,
    equipment,
    {
      ingredients: "Ingredients",
      materials: "Materials & tools",
      servingVessel: "Serving glass / cup",
      utensils: "Utensils & gear",
      toTaste: "to taste",
    },
    (measure) => measure,
    (id: EquipmentId) => id,
  );
  const checklist = steps.join(" ");

  if (!cocktail.ingredients.length) {
    failures.push({ id: cocktail.id, name: cocktail.name, issue: "No ingredients" });
  }
  if (!equipment.length) {
    failures.push({ id: cocktail.id, name: cocktail.name, issue: "No equipment" });
  }
  if (!checklist.includes(cocktail.glass)) {
    failures.push({ id: cocktail.id, name: cocktail.name, issue: `Missing glass: ${cocktail.glass}` });
  }
  for (const ingredient of cocktail.ingredients) {
    if (!checklist.includes(ingredient.name)) {
      failures.push({
        id: cocktail.id,
        name: cocktail.name,
        issue: `Missing ingredient: ${ingredient.name}`,
      });
    }
    if (ingredient.measure && !checklist.includes(ingredient.measure)) {
      failures.push({
        id: cocktail.id,
        name: cocktail.name,
        issue: `Missing amount: ${ingredient.name} (${ingredient.measure})`,
      });
    }
  }
  for (const item of equipment) {
    if (!checklist.includes(item.id)) {
      failures.push({
        id: cocktail.id,
        name: cocktail.name,
        issue: `Missing utensil: ${item.id}`,
      });
    }
  }
}

console.log(
  JSON.stringify(
    {
      cocktails: cocktails.length,
      passing: cocktails.length - new Set(failures.map((failure) => failure.id)).size,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) process.exitCode = 1;
