import type { Cocktail } from "@/lib/types";

export type EquipmentId =
  | "jigger"
  | "cocktailShaker"
  | "mixingGlass"
  | "barSpoon"
  | "hawthorneStrainer"
  | "fineStrainer"
  | "muddler"
  | "citrusJuicer"
  | "knifeAndBoard"
  | "peeler"
  | "blender"
  | "ice"
  | "iceScoop"
  | "teaspoon"
  | "kettleOrHeat"
  | "punchBowl"
  | "ladle"
  | "coffeeMaker"
  | "whiskOrFrother"
  | "grater"
  | "channelKnife";

export type EquipmentItem = {
  id: EquipmentId;
  role: "measure" | "mix" | "prep" | "serve" | "ice" | "heat";
};

function blobOf(c: Cocktail) {
  return [
    c.name,
    c.category,
    c.glass,
    ...c.instructions,
    ...c.ingredients.map((i) => i.name),
    ...c.tags,
  ]
    .join(" ")
    .toLowerCase();
}

export function inferEquipment(cocktail: Cocktail): EquipmentItem[] {
  const blob = blobOf(cocktail);
  const items: EquipmentItem[] = [];
  const add = (id: EquipmentId, role: EquipmentItem["role"]) => {
    if (!items.some((i) => i.id === id)) items.push({ id, role });
  };

  // Measuring is almost always useful
  add("jigger", "measure");

  const isHot =
    /hot toddy|irish coffee|mulled|hot buttered|tom and jerry|glögg|glogg/.test(blob) ||
    (/hot|warm|steam/.test(blob) && /coffee|tea|cider|chocolate|toddy/.test(blob));

  if (isHot) {
    add("teaspoon", "mix");
    add("kettleOrHeat", "heat");
    if (/coffee|espresso/.test(blob)) add("coffeeMaker", "heat");
  } else {
    add("ice", "ice");
    add("iceScoop", "ice");
  }

  const shakes =
    /shake|shaken|shaker/.test(blob) ||
    (/sour|daiquiri|margarita|cosmo|gimlet|clover|whiskey sour|pisco/.test(blob) &&
      !/stir|build/.test(blob));
  const stirs =
    /stir|stirred|mixing glass/.test(blob) ||
    /martini|manhattan|negroni|old fashioned|boulevardier|sazerac|rob roy|martinez/.test(
      cocktail.name.toLowerCase(),
    );
  const builds =
    /build|pour into|highball|collins|spritz|mule|fizz|buck|soda|tonic/.test(blob) &&
    !shakes;
  const muddles = /muddl/.test(blob) || /mint|basil|lime wedges|sugar cube/.test(blob) &&
    /mojito|caipirinha|julep|smash|old fashioned|queen/.test(blob);
  const blends = /blend|blended|frozen|electric mixer|food processor/.test(blob);
  const punches = /punch|bowl/.test(blob) && /punch|party/.test(blob);

  if (shakes) {
    add("cocktailShaker", "mix");
    add("hawthorneStrainer", "mix");
  }
  if (stirs && !shakes) {
    add("mixingGlass", "mix");
    add("barSpoon", "mix");
    add("hawthorneStrainer", "mix");
  }
  if (builds && !shakes && !stirs) {
    add("barSpoon", "mix");
  }
  if (muddles) add("muddler", "prep");
  if (blends) add("blender", "mix");
  if (punches) {
    add("punchBowl", "serve");
    add("ladle", "serve");
  }

  if (/lemon|lime|orange|grapefruit|citrus|juice/.test(blob)) {
    add("citrusJuicer", "prep");
  }
  if (/peel|twist|zest|garnish/.test(blob)) {
    add("peeler", "prep");
    add("knifeAndBoard", "prep");
  }
  if (/egg white|aquafaba|dry shake/.test(blob)) {
    add("fineStrainer", "mix");
    add("cocktailShaker", "mix");
  }
  if (/nutmeg|cinnamon|grate/.test(blob)) add("grater", "prep");
  if (/twist|channel/.test(blob)) add("channelKnife", "prep");
  if (/cream|froth|whip/.test(blob) && !blends) add("whiskOrFrother", "prep");

  // Built drinks still need a spoon sometimes
  if (!items.some((i) => i.role === "mix")) add("barSpoon", "mix");

  return items;
}

/** Expand terse API instructions into clearer numbered steps. */
export function expandMakeSteps(cocktail: Cocktail): string[] {
  const raw = cocktail.instructions.length
    ? cocktail.instructions
    : ["Combine ingredients and serve."];

  const expanded: string[] = [];
  for (const block of raw) {
    const pieces = block
      .split(/(?<=[.!;])\s+(?=[A-Z])|[\n•]+|(?:\s+\d+[\).\-]\s+)/)
      .map((s) => s.replace(/^\d+[\).\-\s]+/, "").trim())
      .filter((s) => s.length > 3);
    if (pieces.length > 1) expanded.push(...pieces);
    else expanded.push(block.trim());
  }

  // Deduplicate near-identical consecutive steps
  const cleaned: string[] = [];
  for (const step of expanded) {
    const normalized = step.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    if (cleaned.some((c) => c.toLowerCase() === normalized.toLowerCase())) continue;
    cleaned.push(normalized.endsWith(".") || normalized.endsWith("!") ? normalized : `${normalized}.`);
  }

  return cleaned.length ? cleaned : ["Combine the ingredients and serve."];
}
