import type { EquipmentId } from "@/lib/make-guide";

export type SketchKind =
  | EquipmentId
  | "glassCocktail"
  | "glassHighball"
  | "glassRocks"
  | "glassCollins"
  | "glassShot"
  | "glassMug"
  | "glassFlute"
  | "glassHurricane"
  | "glassMargarita"
  | "glassWine"
  | "glassPitcher"
  | "glassBeer"
  | "glassIrish"
  | "glassGeneric"
  | "spiritGin"
  | "spiritVodka"
  | "spiritRum"
  | "spiritTequila"
  | "spiritWhiskey"
  | "spiritBrandy"
  | "spiritGeneric"
  | "vermouth"
  | "liqueur"
  | "citrus"
  | "juice"
  | "syrup"
  | "bitters"
  | "sugar"
  | "herb"
  | "dairy"
  | "egg"
  | "coffee"
  | "wine"
  | "beer"
  | "soda"
  | "iceCube"
  | "garnish"
  | "water"
  | "other";

export type ItemInfo = {
  title: string;
  blurb: string;
  sketch: SketchKind;
  /** Consistent ingredient pack-shot (TheCocktailDB); omit for tools/glass. */
  imageUrl?: string;
};

/** Same pack-shot style as the market — transparent PNG stills of the ingredient. */
export function ingredientImageUrl(name: string, size: "full" | "medium" | "small" = "medium") {
  const suffix = size === "full" ? "" : size === "medium" ? "-Medium" : "-Small";
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}${suffix}.png`;
}

const EQUIPMENT_BLURBS: Record<EquipmentId, string> = {
  jigger: "Double-ended cup that portions spirits in exact ounces or milliliters.",
  cocktailShaker: "Sealed tin that chills and blends ingredients with hard ice shakes.",
  mixingGlass: "Thick glass for stirring clear drinks without aeration.",
  barSpoon: "Long twisted spoon for stirring, layering, and fishing out garnishes.",
  hawthorneStrainer: "Spring-edged strainer that holds ice back as you pour.",
  fineStrainer: "Mesh sieve that catches ice shards and pulp for a silky pour.",
  muddler: "Wooden pestle that crushes herbs, fruit, and sugar to release oils.",
  citrusJuicer: "Presses fresh lemon or lime juice without bitter pith.",
  knifeAndBoard: "Cuts garnishes, peels, and fruit wedges cleanly.",
  peeler: "Shaves thin citrus peels for twists and aromatic oils.",
  blender: "Purees ice and fruit into frozen, slushy textures.",
  ice: "Chills and dilutes—the invisible ingredient that finishes balance.",
  iceScoop: "Moves ice hygienically from bin to shaker or glass.",
  teaspoon: "Measures syrups, bitters dashes, and small dry ingredients.",
  kettleOrHeat: "Heats water or tea for hot toddies and coffee drinks.",
  punchBowl: "Large vessel for batch-serving party punches.",
  ladle: "Scoops punch into cups without dripping ice everywhere.",
  coffeeMaker: "Brews espresso or coffee as a hot cocktail base.",
  whiskOrFrother: "Whips cream or aquafaba into light foam.",
  grater: "Microplanes nutmeg or chocolate over the finished drink.",
  channelKnife: "Cuts long citrus spirals for classic twists.",
};

export function equipmentInfo(id: EquipmentId, title: string): ItemInfo {
  return {
    title,
    blurb: EQUIPMENT_BLURBS[id],
    sketch: id,
  };
}

function glassSketch(glass: string): SketchKind {
  const g = glass.toLowerCase();
  if (/martini|cocktail/.test(g)) return "glassCocktail";
  if (/highball/.test(g)) return "glassHighball";
  if (/old[- ]?fashioned|rocks|whiskey sour/.test(g)) return "glassRocks";
  if (/collins/.test(g)) return "glassCollins";
  if (/shot/.test(g)) return "glassShot";
  if (/irish/.test(g)) return "glassIrish";
  if (/coffee|mug|cup/.test(g)) return "glassMug";
  if (/flute|champagne/.test(g)) return "glassFlute";
  if (/hurricane/.test(g)) return "glassHurricane";
  if (/margarita/.test(g)) return "glassMargarita";
  if (/wine/.test(g)) return "glassWine";
  if (/pitcher|bowl/.test(g) && !/punch/.test(g)) return "glassPitcher";
  if (/punch/.test(g)) return "punchBowl";
  if (/beer|pint/.test(g)) return "glassBeer";
  return "glassGeneric";
}

const GLASS_BLURBS: Record<string, string> = {
  glassCocktail: "V-shaped coupe for stirred or shaken classics served up.",
  glassHighball: "Tall glass that keeps long, bubbly drinks cold and lively.",
  glassRocks: "Short, sturdy tumbler for spirits on ice or muddled builds.",
  glassCollins: "Taller cousin of the highball—room for soda and ice.",
  glassShot: "Small glass for neat pours and layered shooters.",
  glassMug: "Holds heat for coffee cocktails and hot toddies.",
  glassFlute: "Narrow stemware that keeps bubbles rising in sparkling drinks.",
  glassHurricane: "Curvy tropical glass that shows off colorful frozen pours.",
  glassMargarita: "Wide-rimmed glass made for salted edges and citrus.",
  glassWine: "Stemmed bowl that opens aromatics in wine-based drinks.",
  glassPitcher: "Batch vessel for sharing spritzes and coolers.",
  glassBeer: "Handle mug for beer mixes and heavy ice builds.",
  glassIrish: "Footed glass mug that keeps hot coffee drinks warm.",
  glassGeneric: "The vessel that shapes aroma, dilution, and first sip.",
  punchBowl: "Wide bowl for ladling communal punches.",
};

export function glassInfo(glass: string): ItemInfo {
  const sketch = glassSketch(glass);
  return {
    title: glass,
    blurb: GLASS_BLURBS[sketch] || GLASS_BLURBS.glassGeneric,
    sketch,
  };
}

type IngredientProfile = { sketch: SketchKind; blurb: string };

function ingredientProfile(name: string): IngredientProfile {
  const n = name.toLowerCase();

  if (/\bgin\b/.test(n))
    return { sketch: "spiritGin", blurb: "Juniper-forward spirit—bright, herbal, and dry." };
  if (/vodka/.test(n))
    return { sketch: "spiritVodka", blurb: "Clean, neutral base that lets mixers shine." };
  if (/rum|cachaca|cachaça/.test(n))
    return { sketch: "spiritRum", blurb: "Cane spirit ranging from grassy light to rich molasses." };
  if (/tequila|mezcal/.test(n))
    return { sketch: "spiritTequila", blurb: "Agave spirit—peppery heat with earthy sweetness." };
  if (/whiskey|whisky|bourbon|rye|scotch|irish whiskey/.test(n))
    return { sketch: "spiritWhiskey", blurb: "Grain spirit with oak, caramel, and spice." };
  if (/brandy|cognac|pisco|armagnac/.test(n))
    return { sketch: "spiritBrandy", blurb: "Distilled fruit warmth—soft fruit and vanilla." };
  if (/vermouth/.test(n))
    return { sketch: "vermouth", blurb: "Fortified, herb-laced wine that sweetens or dries a mix." };
  if (/bitters/.test(n))
    return { sketch: "bitters", blurb: "Concentrated aromatics—a few dashes reshape the whole drink." };
  if (/triple sec|cointreau|curaçao|curacao|grand marnier|amaretto|kahlua|baileys|liqueur|schnapps|sambuca|chartreuse|benedictine|maraschino|creme de|crème de|galliano|frangelico|chambord|ricard|pastis|pernod|anisette|\banis\b|aperitif/.test(n))
    return { sketch: "liqueur", blurb: "Sweet, flavored spirit that adds depth and finish." };
  if (/lemon|lime|orange|grapefruit|citrus/.test(n) && /juice|peel|twist|zest|wedge|slice|rind/.test(n))
    return { sketch: "citrus", blurb: "Sharp acidity and oils that brighten and balance sweetness." };
  if (/^(lemon|lime|orange|grapefruit)$/.test(n) || /lemon|lime|orange peel|lime peel/.test(n))
    return { sketch: "citrus", blurb: "Fresh citrus—juice for bite, peel for perfume." };
  if (/juice/.test(n))
    return { sketch: "juice", blurb: "Fruit sweetness and acid that softens strong spirits." };
  if (/grenadine|syrup|honey|agave|orgeat|simple/.test(n))
    return { sketch: "syrup", blurb: "Sweet binder that rounds edges and carries flavor." };
  if (/sugar|powdered sugar|sugar syrup|cube/.test(n))
    return { sketch: "sugar", blurb: "Sweet backbone—dissolves into body and balance." };
  if (/mint|basil|cilantro|herb|rosemary|thyme|lavender/.test(n))
    return { sketch: "herb", blurb: "Fresh greens that perfume the glass with volatile oils." };
  if (/milk|cream|half[- ]and[- ]half|condensed|evaporated|yogurt|coconut cream/.test(n))
    return { sketch: "dairy", blurb: "Silky richness that softens heat and adds body." };
  if (/egg|aquafaba/.test(n))
    return { sketch: "egg", blurb: "Whips into foam—adds texture and a soft mouthfeel." };
  if (/coffee|espresso|cold brew/.test(n))
    return { sketch: "coffee", blurb: "Roasted bitterness that grounds sweet and creamy mixes." };
  if (/wine|champagne|prosecco|sparkling wine|port|sherry/.test(n))
    return { sketch: "wine", blurb: "Fermented fruit lift—bubbles or oxidative depth." };
  if (/beer|ale|lager|stout/.test(n))
    return { sketch: "beer", blurb: "Malty fizz that lengthens highballs and punches." };
  if (/soda|tonic|ginger beer|ginger ale|cola|club soda|sparkling water|perrier|sprite|7[- ]?up/.test(n))
    return { sketch: "soda", blurb: "Bubbles that stretch the drink and snap the finish." };
  if (/^ice$|crushed ice|ice cubes/.test(n))
    return { sketch: "iceCube", blurb: "Chills fast and dilutes just enough to open flavors." };
  if (/^water$|hot water|boiling water/.test(n))
    return { sketch: "water", blurb: "Silent diluter—opens aromatics without adding taste." };
  if (/cherry|olive|onion|celery|cinnamon|nutmeg|chocolate|salt|pepper|garnish/.test(n))
    return { sketch: "garnish", blurb: "Finishing touch—aroma and color before the first sip." };
  if (/absinthe|aquavit|sake|soju|baijiu|spirit|liqueur/.test(n))
    return { sketch: "spiritGeneric", blurb: "Base spirit—the backbone that carries the cocktail." };

  return {
    sketch: "other",
    blurb: "A supporting flavor that fills gaps and ties the mix together.",
  };
}

export function ingredientInfo(name: string): ItemInfo {
  const profile = ingredientProfile(name);
  return {
    title: name,
    blurb: profile.blurb,
    sketch: profile.sketch,
    imageUrl: ingredientImageUrl(name, "medium"),
  };
}
