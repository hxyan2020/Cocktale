/** Seed Cocktale DB from TheCocktailDB (legitimate public API). */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const API = "https://www.thecocktaildb.com/api/json/v1/1";

type RawDrink = {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate: string | null;
  strTags: string | null;
  strCategory: string | null;
  strIBA: string | null;
  strAlcoholic: string | null;
  strGlass: string | null;
  strInstructions: string | null;
  strDrinkThumb: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;
  [key: string]: string | null;
};

export type Cocktail = {
  id: string;
  name: string;
  alternateName: string | null;
  image: string;
  category: string;
  iba: string | null;
  alcoholic: boolean;
  glass: string;
  origin: string;
  description: string;
  story: string;
  ingredients: { name: string; measure: string | null }[];
  instructions: string[];
  tags: string[];
  moods: string[];
  situations: string[];
  suitableFor: string[];
  weatherAffinity: ("hot" | "warm" | "mild" | "cool" | "cold" | "rainy")[];
  popularity: number;
  flavorProfile: string[];
};

const ORIGIN_MAP: Record<string, string> = {
  Margarita: "Mexico / Tijuana or Ciudad Juárez (disputed)",
  Mojito: "Cuba / Havana",
  Daiquiri: "Cuba / Daiquirí mining town",
  "Piña Colada": "Puerto Rico / San Juan",
  Negroni: "Italy / Florence",
  Martini: "United States (disputed; New York / Martinez, CA)",
  Manhattan: "United States / New York City",
  OldFashioned: "United States / Louisville, Kentucky",
  "Old Fashioned": "United States / Louisville, Kentucky",
  Cosmopolitan: "United States / New York City (popularized)",
  "Whiskey Sour": "United States / Peru-origin claims; American classic",
  "Gin Fizz": "United States / New Orleans",
  Sazerac: "United States / New Orleans",
  "Bloody Mary": "France / Paris (Harry's New York Bar)",
  "Moscow Mule": "United States / Los Angeles",
  "French 75": "France / Paris",
  Sidecar: "France / Paris (or London)",
  "Tom Collins": "United Kingdom / London",
  Gimlet: "United Kingdom (Royal Navy)",
  "Dark and Stormy": "Bermuda",
  "Singapore Sling": "Singapore / Raffles Hotel",
  MaiTai: "United States / California (Trader Vic's)",
  "Mai Tai": "United States / California (Trader Vic's)",
  "Pisco Sour": "Peru / Lima (also claimed by Chile)",
  Caipirinha: "Brazil",
  Spritz: "Italy / Veneto",
  "Aperol Spritz": "Italy / Veneto / Padua",
  Bellini: "Italy / Venice",
  Kir: "France / Burgundy",
  "Irish Coffee": "Ireland / Foynes",
  EspressoMartini: "United Kingdom / London",
  "Espresso Martini": "United Kingdom / London",
  "Long Island Tea": "United States / Long Island, New York",
  "Long Island Iced Tea": "United States / Long Island, New York",
  "Penicillin": "United States / New York City (modern classic)",
  "Paper Plane": "United States / Chicago / New York",
  Boulevardier: "France / Paris (Harry's New York Bar)",
  "Vieux Carré": "United States / New Orleans",
  "Last Word": "United States / Detroit",
  "Aviation": "United States / New York",
  "Bee's Knees": "United States (Prohibition era)",
  "Clover Club": "United States / Philadelphia",
  "Corpse Reviver": "United Kingdom / London",
  "Corpse Reviver #2": "United Kingdom / London",
  "Hanky Panky": "United Kingdom / London",
  "Americano": "Italy",
  "Rusty Nail": "United Kingdom / Scotland association",
  "Godfather": "Italy / United States (popularized)",
  "Black Russian": "Belgium / Brussels",
  "White Russian": "Belgium / Brussels (variation)",
  "Tequila Sunrise": "United States / California / Arizona claims",
  Paloma: "Mexico",
  "Ranch Water": "United States / Texas",
  "Hurricane": "United States / New Orleans",
  Zombie: "United States / Hollywood (Don the Beachcomber)",
  "Painkiller": "British Virgin Islands",
  "Blue Lagoon": "France / Paris",
  "Sex on the Beach": "United States",
  "Bahama Mama": "Bahamas / Caribbean",
  "Planter's Punch": "Jamaica",
  "Rum Punch": "Caribbean",
  "Mint Julep": "United States / Southern U.S. / Kentucky",
  "Brandy Alexander": "United Kingdom / United States",
  Grasshopper: "United States / New Orleans",
  "Amaretto Sour": "Italy / United States popularization",
  "Japanese Cocktail": "United States / New York (Jerry Thomas)",
  "Champagne Cocktail": "United Kingdom / United States",
  Mimosa: "France / Paris",
  "Death in the Afternoon": "France (Hemingway)",
  "Vesper": "Literary / United Kingdom (Casino Royale)",
  "Naked and Famous": "United States / New York (modern classic)",
  "Tommy's Margarita": "United States / San Francisco",
  "Gin and Tonic": "India / British Raj origins; Spain popularization",
  "Cuba Libre": "Cuba",
  "Rum and Coke": "Cuba / United States",
  "Hot Toddy": "United Kingdom / Scotland & Ireland traditions",
  "Mulled Wine": "Europe (medieval origins)",
  "Egg Nog": "United Kingdom / United States",
  "Bramble": "United Kingdom / London",
  "Southside": "United States / Chicago / New York claims",
  "Mary Pickford": "Cuba / Havana",
  "El Presidente": "Cuba / Havana",
  "Between the Sheets": "France / Paris",
  "French Connection": "France",
  "Golden Dream": "Italy / Netherlands claims",
  "Harvey Wallbanger": "United States / California",
  "B-52": "Canada / Alberta (claimed)",
  "Alabama Slammer": "United States / Southern U.S.",
  "Fuzzy Navel": "United States",
  "Screwdriver": "United States",
  "Highball": "United Kingdom / United States",
  "Whisky Highball": "Japan / United Kingdom roots",
};

const STORY_MAP: Record<string, string> = {
  Negroni:
    "Legend credits Count Camillo Negroni, who asked Florence’s Caffè Casoni to stiffen his Americano with gin instead of soda—birthing the equal-parts classic.",
  Margarita:
    "Several origin tales compete: a showgirl, a socialite, and Tijuana bartenders all claim the salt-rimmed tequila sour that conquered the world.",
  Mojito:
    "Born in Havana’s heat, the Mojito likely descended from the medicinal Draque—rum, lime, sugar, and mint long before cocktail menus existed.",
  Martini:
    "The dry Martini became the icon of urbane drinking; its exact birthplace is argued from Martinez, California to New York’s Knickerbocker Hotel.",
  Manhattan:
    "Often tied to a 1870s New York party at the Manhattan Club, this whiskey–vermouth–bitters triad defined American elegance.",
  "Old Fashioned":
    "When ‘cocktail’ meant spirit, sugar, water, and bitters, patrons asked for it the ‘old-fashioned’ way—and Louisville still claims the cradle.",
  Daiquiri:
    "American engineers near the Daiquirí mines mixed rum with lime and sugar; Hemingway later preferred his without sugar, frozen and fierce.",
  "Espresso Martini":
    "Dick Bradsell created it in 1980s London when a model asked for a drink to ‘wake me up, then fuck me up’—coffee met vodka in a shaker.",
  "Singapore Sling":
    "Ngiam Tong Boon of Raffles Hotel mixed this pink gin sling for guests seeking a socially acceptable ‘lady’s drink’ with a kick.",
  "Pisco Sour":
    "Victor Morris’s Lima bar popularized egg-white pisco sours in the early 1900s; Peru and Chile still spar over pisco’s soul.",
  Caipirinha:
    "Brazil’s national cocktail muddles lime with cachaça and sugar—simple, bright, and inseparable from carnival energy.",
  Sazerac:
    "New Orleans’ official cocktail rinses a glass with absinthe before cognac or rye, sugar, and Peychaud’s—pharmacy roots, barroom immortality.",
  "Dark and Stormy":
    "Gosling’s Black Seal and ginger beer met in Bermuda’s storms; the trademarked mix remains a sailor’s weather report in a glass.",
  "French 75":
    "Named for a WWI field gun, this gin–lemon–champagne sparkler hits with surprising force beneath its celebration polish.",
  Boulevardier:
    "The Negroni’s whiskey cousin appeared in Paris’s Prohibition-exile scene—Campari bitterness wrapped in American rye comfort.",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractIngredients(d: RawDrink) {
  const out: { name: string; measure: string | null }[] = [];
  for (let i = 1; i <= 15; i++) {
    const name = d[`strIngredient${i}`];
    if (!name || !name.trim()) continue;
    const measure = d[`strMeasure${i}`];
    out.push({ name: name.trim(), measure: measure?.trim() || null });
  }
  return out;
}

function stepsFromInstructions(text: string | null): string[] {
  if (!text) return ["Prepare ingredients.", "Mix and serve."];
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const byNum = cleaned
    .split(/\n+/)
    .map((s) => s.replace(/^\d+[\).\-\s]+/, "").trim())
    .filter(Boolean);
  if (byNum.length > 1) return byNum;
  const bySent = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  return bySent.length ? bySent : [cleaned];
}

function inferMoods(d: RawDrink, ingredients: string[], name: string): string[] {
  const blob = `${name} ${d.strCategory} ${d.strGlass} ${ingredients.join(" ")} ${(d.strTags || "")}`.toLowerCase();
  const moods: string[] = [];
  if (/martini|negroni|manhattan|old fashioned|boulevardier|sazerac|whiskey|bourbon|rye/.test(blob))
    moods.push("sophisticated", "reflective");
  if (/mojito|margarita|daiquiri|colada|spritz|paloma|highball|fizz|collins/.test(blob))
    moods.push("celebratory", "social", "lighthearted");
  if (/coffee|espresso|irish|toddy|hot/.test(blob)) moods.push("cozy", "focused");
  if (/punch|tiki|zombie|mai tai|hurricane|painkiller/.test(blob)) moods.push("adventurous", "playful");
  if (/sour|gimlet|aviation|last word|corpse/.test(blob)) moods.push("curious", "bright");
  if (/cream|alexander|grasshopper|white russian|eggnog/.test(blob)) moods.push("indulgent", "nostalgic");
  if (/champagne|bellini|mimosa|french 75|kir/.test(blob)) moods.push("romantic", "celebratory");
  if (!moods.length) moods.push("curious", "social");
  return [...new Set(moods)];
}

function inferWeather(ingredients: string[], name: string, category: string): Cocktail["weatherAffinity"] {
  const blob = `${name} ${category} ${ingredients.join(" ")}`.toLowerCase();
  if (/toddy|irish coffee|hot|mulled|eggnog/.test(blob)) return ["cold", "cool", "rainy"];
  if (/colada|mojito|margarita|paloma|spritz|fizz|collins|highball|lemonade|tiki|punch/.test(blob))
    return ["hot", "warm"];
  if (/negroni|manhattan|old fashioned|martini|boulevardier|sazerac|whiskey/.test(blob))
    return ["cool", "mild", "rainy"];
  if (/sour|daiquiri|gimlet/.test(blob)) return ["warm", "mild", "hot"];
  return ["mild", "warm", "cool"];
}

function inferSituations(moods: string[], alcoholic: boolean): string[] {
  const s = new Set<string>();
  if (moods.includes("celebratory")) s.add("Birthdays & toasts").add("Weekend brunch");
  if (moods.includes("romantic")) s.add("Date night").add("Anniversaries");
  if (moods.includes("sophisticated")) s.add("After-work wind-down").add("Dinner party opener");
  if (moods.includes("cozy")) s.add("Rainy evenings").add("Reading by the window");
  if (moods.includes("adventurous")) s.add("Tiki nights").add("Vacation mode at home");
  if (moods.includes("social")) s.add("House parties").add("Friends over");
  if (moods.includes("reflective")) s.add("Solo nightcap").add("Jazz & low lights");
  if (!alcoholic) s.add("Dry January").add("Designated driver nights");
  if (!s.size) s.add("Anytime aperitivo").add("Curious home bartending");
  return [...s];
}

function inferSuitableFor(moods: string[], ingredients: string[]): string[] {
  const blob = ingredients.join(" ").toLowerCase();
  const people: string[] = [];
  if (/gin|vermouth|campari|chartreuse/.test(blob) || moods.includes("sophisticated"))
    people.push("Classic cocktail lovers");
  if (/rum|mint|lime|pineapple|coconut/.test(blob)) people.push("Tropical-leaning drinkers");
  if (/tequila|mezcal/.test(blob)) people.push("Agave fans");
  if (/vodka/.test(blob)) people.push("Clean-spirit drinkers");
  if (/whiskey|bourbon|rye|scotch/.test(blob)) people.push("Whiskey drinkers");
  if (moods.includes("lighthearted")) people.push("First-time cocktail explorers");
  if (moods.includes("curious")) people.push("Home bartenders leveling up");
  if (!people.length) people.push("Anyone building a better bar shelf");
  return [...new Set(people)];
}

function inferFlavors(ingredients: string[], name: string): string[] {
  const blob = `${name} ${ingredients.join(" ")}`.toLowerCase();
  const f: string[] = [];
  if (/lemon|lime|sour|citrus/.test(blob)) f.push("citrus");
  if (/sugar|syrup|honey|liqueur|colada|cream/.test(blob)) f.push("sweet");
  if (/campari|amaro|bitter|negroni|aperol/.test(blob)) f.push("bitter");
  if (/mint|basil|herbal|chartreuse|genepy/.test(blob)) f.push("herbal");
  if (/smoke|mezcal|islay|peat/.test(blob)) f.push("smoky");
  if (/spice|ginger|cinnamon|allspice|falernum/.test(blob)) f.push("spicy");
  if (/coffee|espresso|chocolate|cocoa/.test(blob)) f.push("roasty");
  if (/dry|martini|vermouth/.test(blob)) f.push("dry");
  if (!f.length) f.push("balanced");
  return [...new Set(f)];
}

function popularityScore(d: RawDrink, name: string): number {
  let score = 40;
  if (d.strIBA) score += 35;
  if (ORIGIN_MAP[name] || STORY_MAP[name]) score += 15;
  const classics = [
    "Margarita",
    "Mojito",
    "Martini",
    "Negroni",
    "Old Fashioned",
    "Manhattan",
    "Daiquiri",
    "Whiskey Sour",
    "Espresso Martini",
    "Aperol Spritz",
    "Piña Colada",
    "Cosmopolitan",
    "Gin and Tonic",
    "Bloody Mary",
    "Moscow Mule",
  ];
  if (classics.includes(name)) score += 20;
  if ((d.strTags || "").toLowerCase().includes("iba")) score += 10;
  return Math.min(100, score);
}

function descriptionFor(d: RawDrink, origin: string, flavors: string[]): string {
  const iba = d.strIBA ? ` An IBA ${d.strIBA} cocktail.` : "";
  const glass = d.strGlass ? ` Served in a ${d.strGlass.toLowerCase()}.` : "";
  const flavor = flavors.length ? ` Expect a ${flavors.slice(0, 3).join(", ")} profile.` : "";
  return `${d.strDrink} is a ${d.strCategory?.toLowerCase() || "classic"} drink with roots in ${origin}.${iba}${glass}${flavor}`;
}

function storyFor(name: string, origin: string, category: string): string {
  if (STORY_MAP[name]) return STORY_MAP[name];
  return `Part of the living ${category.toLowerCase()} tradition, ${name} is widely associated with ${origin}. Home bartenders keep reinventing it—ratios stay familiar, proportions tell the tale.`;
}

function normalize(d: RawDrink): Cocktail {
  const name = d.strDrink.trim();
  const ingredients = extractIngredients(d);
  const ingredientNames = ingredients.map((i) => i.name);
  const origin = ORIGIN_MAP[name] || (d.strIBA ? "International classic (IBA)" : "Global cocktail tradition");
  const moods = inferMoods(d, ingredientNames, name);
  const alcoholic = (d.strAlcoholic || "").toLowerCase() !== "non alcoholic";
  const flavors = inferFlavors(ingredientNames, name);
  const category = d.strCategory || "Cocktail";
  const tags = (d.strTags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    id: d.idDrink,
    name,
    alternateName: d.strDrinkAlternate,
    image: d.strDrinkThumb || "",
    category,
    iba: d.strIBA,
    alcoholic,
    glass: d.strGlass || "Cocktail glass",
    origin,
    description: descriptionFor(d, origin, flavors),
    story: storyFor(name, origin, category),
    ingredients,
    instructions: stepsFromInstructions(d.strInstructions),
    tags,
    moods,
    situations: inferSituations(moods, alcoholic),
    suitableFor: inferSuitableFor(moods, ingredientNames),
    weatherAffinity: inferWeather(ingredientNames, name, category),
    popularity: popularityScore(d, name),
    flavorProfile: flavors,
  };
}

async function fetchLetter(letter: string): Promise<RawDrink[]> {
  const res = await fetch(`${API}/search.php?f=${encodeURIComponent(letter)}`);
  if (!res.ok) throw new Error(`Failed ${letter}: ${res.status}`);
  const data = (await res.json()) as { drinks: RawDrink[] | null };
  return data.drinks || [];
}

async function main() {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  const byId = new Map<string, RawDrink>();

  for (const letter of letters) {
    process.stdout.write(`Fetching ${letter}... `);
    try {
      const drinks = await fetchLetter(letter);
      for (const d of drinks) byId.set(d.idDrink, d);
      console.log(`${drinks.length} drinks (unique total ${byId.size})`);
    } catch (e) {
      console.log(`error: ${(e as Error).message}`);
    }
    await sleep(200);
  }

  const cocktails = [...byId.values()]
    .map(normalize)
    .sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));

  const outDir = join(process.cwd(), "src", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "cocktails.json");
  writeFileSync(outPath, JSON.stringify(cocktails, null, 2), "utf8");

  const meta = {
    sourcedFrom: "TheCocktailDB public API",
    generatedAt: new Date().toISOString(),
    count: cocktails.length,
    alcoholic: cocktails.filter((c) => c.alcoholic).length,
    withIba: cocktails.filter((c) => c.iba).length,
  };
  writeFileSync(join(outDir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
  console.log(`\nWrote ${cocktails.length} cocktails → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
