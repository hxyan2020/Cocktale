import type { GalleryImage } from "@/lib/cocktail-gallery";

const UA = "Cocktale/1.0 (https://github.com/hxyan2020/Cocktale; cocktail photo gallery)";

type CommonsPage = {
  title: string;
  index?: number;
  imageinfo?: Array<{
    mime?: string;
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    width?: number;
    height?: number;
  }>;
};

type CommonsQuery = {
  query?: { pages?: Record<string, CommonsPage> };
};

const SKIP =
  /\b(logo|icon|flag|map|svg|poster|sign|neon|menu|label|bottle|ingredient|ingredients|building|street|alley|hotel|portrait|statue|museum|roosevelt|person|people)\b/i;

function compact(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanUrl(url: string) {
  try {
    const u = new URL(url);
    u.search = "";
    return u.toString();
  } catch {
    return url;
  }
}

function fileLooksLikeThisCocktail(title: string, cocktailName: string): boolean {
  const file = title.replace(/^File:/i, "").replace(/\.[a-z0-9]+$/i, "");
  const t = file.toLowerCase();
  const name = cocktailName.toLowerCase();
  const nameCompact = compact(name);
  const fileCompact = compact(file);

  if (nameCompact.length < 4) return false;
  if (SKIP.test(t)) return false;
  if (!fileCompact.includes(nameCompact)) return false;

  const idx = t.indexOf(name);
  const compactIdx = fileCompact.indexOf(nameCompact);
  const nearStart = (idx >= 0 && idx <= 12) || compactIdx <= 8;
  const drinkCue =
    /\b(cocktail|cocktails|drink|drinks|glass|served|pour)\b/i.test(t) ||
    fileCompact.includes(`${nameCompact}cocktail`);
  const mostlyName =
    fileCompact === nameCompact ||
    fileCompact === `${nameCompact}cocktail` ||
    (fileCompact.startsWith(nameCompact) && fileCompact.length <= nameCompact.length + 16);

  return nearStart && (drinkCue || mostlyName);
}

function searchTerm(name: string) {
  const n = name.trim();
  if (/\bcocktail\b/i.test(n)) return `${n} filetype:bitmap`;
  return `${n} cocktail filetype:bitmap`;
}

export async function fetchWikiCocktailPhotos(name: string, limit = 5): Promise<GalleryImage[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "24",
    gsrsearch: searchTerm(name),
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: "1400",
  });

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as CommonsQuery;
  const pages = Object.values(data.query?.pages || {}).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99),
  );

  const out: GalleryImage[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    if (!fileLooksLikeThisCocktail(page.title, name)) continue;
    const info = page.imageinfo?.[0];
    const mime = info?.mime || "";
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mime)) continue;
    const width = info?.width || 0;
    const height = info?.height || 0;
    if (width < 1000 || height < 800 || width * height < 1_000_000) continue;
    const url = cleanUrl(info?.thumburl || info?.url || "");
    if (!url.startsWith("https://upload.wikimedia.org/") || seen.has(url)) continue;
    seen.add(url);
    out.push({
      id: `wiki-${page.title}`,
      url,
      alt: `${name} — ${page.title.replace(/^File:/i, "")}`,
      label: name,
      width,
      height,
      credit: "Wikimedia Commons",
      creditUrl: info?.descriptionurl,
      license: "See source license",
    });
    if (out.length >= limit) break;
  }

  return out;
}
