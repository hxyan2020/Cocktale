import type { Cocktail, WeatherBucket } from "@/lib/types";

export type CocktailContentPatch = Partial<Omit<Cocktail, "id">>;

export type EditSource = "human" | "ai" | "catalog";

export type FieldStamp = {
  createdAt: string;
  updatedAt: string;
  source: "human" | "ai";
};

/** Who wrote an idea, and when it was created or last changed. */
export type CocktailEditorial = {
  createdAt: string | null;
  createdBy: EditSource;
  updatedAt: string | null;
  updatedBy: EditSource;
  fields: Record<string, FieldStamp>;
};

export type CocktailProfilesStore = {
  /** Sparse edits on catalog cocktails (and patches on customs). */
  overrides: Record<string, CocktailContentPatch>;
  /** Fully custom cocktails created in admin. */
  customs: Record<string, Cocktail>;
  /** Soft-deleted cocktail ids (catalog or custom). */
  deleted: string[];
  editorial: Record<string, CocktailEditorial>;
};

export const WEATHER_BUCKETS: WeatherBucket[] = [
  "hot",
  "warm",
  "mild",
  "cool",
  "cold",
  "rainy",
];

export function emptyProfilesStore(): CocktailProfilesStore {
  return { overrides: {}, customs: {}, deleted: [], editorial: {} };
}

export function normalizeProfilesStore(raw: unknown): CocktailProfilesStore {
  const base = emptyProfilesStore();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<CocktailProfilesStore>;
  if (data.overrides && typeof data.overrides === "object") {
    base.overrides = { ...data.overrides };
  }
  if (data.customs && typeof data.customs === "object") {
    base.customs = { ...data.customs };
  }
  if (Array.isArray(data.deleted)) {
    base.deleted = [...new Set(data.deleted.filter((id) => typeof id === "string"))];
  }
  if (data.editorial && typeof data.editorial === "object") {
    base.editorial = { ...data.editorial };
  }
  return base;
}

export function touchEditorial(
  current: CocktailEditorial | undefined,
  source: "human" | "ai",
  fields: string[],
  mode: "create" | "catalog" | "update",
): CocktailEditorial {
  const now = new Date().toISOString();
  const base: CocktailEditorial =
    current ??
    (mode === "create"
      ? {
          createdAt: now,
          createdBy: "human",
          updatedAt: now,
          updatedBy: "human",
          fields: {},
        }
      : {
          createdAt: null,
          createdBy: "catalog",
          updatedAt: null,
          updatedBy: "catalog",
          fields: {},
        });

  const nextFields = { ...base.fields };
  for (const field of fields) {
    const prev = nextFields[field];
    nextFields[field] = {
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
      source,
    };
  }

  const changed = fields.length > 0;
  return {
    createdAt: base.createdAt,
    createdBy: base.createdBy,
    updatedAt: changed ? now : base.updatedAt,
    updatedBy: changed ? source : base.updatedBy,
    fields: nextFields,
  };
}

export function formatStampTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function sourceLabel(source: EditSource) {
  if (source === "ai") return "suggested by AI";
  if (source === "human") return "by human";
  return "from the catalog";
}

export function mergeCocktailContent(
  base: Cocktail,
  patch: CocktailContentPatch | undefined,
): Cocktail {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    id: base.id,
    ingredients: patch.ingredients ?? base.ingredients,
    instructions: patch.instructions ?? base.instructions,
    tags: patch.tags ?? base.tags,
    moods: patch.moods ?? base.moods,
    situations: patch.situations ?? base.situations,
    suitableFor: patch.suitableFor ?? base.suitableFor,
    weatherAffinity: patch.weatherAffinity ?? base.weatherAffinity,
    flavorProfile: patch.flavorProfile ?? base.flavorProfile,
  };
}

export function resolveCocktailFromProfiles(
  id: string,
  catalog: Cocktail | undefined,
  store: CocktailProfilesStore,
): Cocktail | undefined {
  if (store.deleted.includes(id)) return undefined;
  const custom = store.customs[id];
  if (custom) return mergeCocktailContent(custom, store.overrides[id]);
  if (!catalog) return undefined;
  return mergeCocktailContent(catalog, store.overrides[id]);
}

export function listCocktailsFromProfiles(
  catalog: Cocktail[],
  store: CocktailProfilesStore,
): Cocktail[] {
  const deleted = new Set(store.deleted);
  const out: Cocktail[] = [];
  const seen = new Set<string>();

  for (const c of catalog) {
    if (deleted.has(c.id)) continue;
    out.push(mergeCocktailContent(c, store.overrides[c.id]));
    seen.add(c.id);
  }
  for (const [id, custom] of Object.entries(store.customs)) {
    if (deleted.has(id) || seen.has(id)) continue;
    out.push(mergeCocktailContent(custom, store.overrides[id]));
  }
  return out;
}

export function emptyCocktailDraft(id: string): Cocktail {
  return {
    id,
    name: "New cocktail",
    alternateName: null,
    image: "/cocktail-fallback.svg",
    category: "Cocktail",
    iba: null,
    alcoholic: true,
    glass: "Cocktail glass",
    origin: "",
    description: "",
    story: "",
    ingredients: [{ name: "", measure: null }],
    instructions: [""],
    tags: [],
    moods: [],
    situations: [],
    suitableFor: [],
    weatherAffinity: [],
    popularity: 50,
    flavorProfile: [],
  };
}

export function slugifyCocktailId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `custom-${base || "cocktail"}-${Date.now().toString(36)}`;
}
