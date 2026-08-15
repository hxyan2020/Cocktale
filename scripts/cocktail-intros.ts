type IntroInput = {
  name: string;
  category: string;
  glass: string;
  origin: string;
  alcoholic: boolean;
  ingredients: string[];
  flavors: string[];
};

function stableVariant(value: string, count: number) {
  let hash = 0;
  for (const char of value) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % count;
}

function list(items: string[]) {
  if (items.length < 2) return items[0] || "a compact ingredient list";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function categoryLabel(category: string) {
  const normalized = category.toLowerCase().replace(/\s+drink$/, "");
  return normalized === "ordinary" ? "highball-style cocktail" : normalized;
}

function glassLabel(glass: string) {
  return glass.toLowerCase().replace(/\s+glass$/, " glass");
}

function flavorLabel(flavors: string[]) {
  const useful = flavors.filter((flavor) => flavor !== "balanced").slice(0, 3);
  return useful.length ? list(useful) : "easygoing and balanced";
}

function article(phrase: string) {
  return /^[aeiou]/i.test(phrase) ? "an" : "a";
}

export function descriptionForCocktail(input: IntroInput) {
  const category = categoryLabel(input.category);
  const glass = glassLabel(input.glass);
  const flavors = flavorLabel(input.flavors);
  const lead = input.ingredients[0] || (input.alcoholic ? "its base spirit" : "its alcohol-free base");
  const variants = [
    `${input.name} is ${article(flavors)} ${flavors} ${category} built around ${lead}, served in a ${glass}.`,
    `Built around ${lead}, ${input.name} brings a ${flavors} profile to a ${glass}.`,
    `${input.name} pairs ${lead} with a ${flavors} character in a ${glass}.`,
    `A ${category} led by ${lead}, ${input.name} lands ${flavors} and is served in a ${glass}.`,
    `Pour ${input.name} when you want something ${flavors}: a ${category} centered on ${lead}.`,
  ];
  return variants[stableVariant(input.name, variants.length)];
}

export function storyForCocktail(input: IntroInput) {
  const ingredients = list(input.ingredients.slice(0, 3));
  const glass = glassLabel(input.glass);
  const flavors = flavorLabel(input.flavors);
  const origin =
    input.origin === "Global cocktail tradition" ? "the modern home-bar repertoire" : input.origin;
  const variants = [
    `${input.name} lets ${ingredients} do the talking. Served in a ${glass}, it comes together as a ${flavors} drink with an unfussy finish.`,
    `The appeal of ${input.name} is in the way ${ingredients} meet: direct, distinctive and easy to understand from the first sip. Its ${flavors} profile makes it a natural fit for a ${glass}.`,
    `Think of ${input.name} as a study in contrast. ${ingredients} share the glass without losing their individual character, creating a result that feels ${flavors}.`,
    `${input.name} belongs to ${origin}, but its identity is ingredient-led rather than ceremonial. ${ingredients} shape a ${flavors} pour designed for a ${glass}.`,
    `There is no need to overcomplicate ${input.name}. Its character comes from ${ingredients}, with the ${glass} keeping the serve relaxed and the flavors ${flavors}.`,
    `At the center of ${input.name} is a simple idea: bring ${ingredients} into balance and let the serve stay clear. In a ${glass}, that idea reads as ${flavors}.`,
    `${input.name} is less about elaborate technique than the chemistry between ${ingredients}. The finished drink is ${flavors}, with a presentation that suits its ${glass}.`,
    `Built for the moment when a straightforward pour is exactly right, ${input.name} combines ${ingredients}. The result is ${flavors} rather than showy, served in a ${glass}.`,
  ];
  return variants[stableVariant(input.name, variants.length)];
}
