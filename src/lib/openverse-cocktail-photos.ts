import type { GalleryImage } from "@/lib/cocktail-gallery";

type OpenverseImage = {
  id: string;
  title?: string | null;
  url?: string | null;
  creator?: string | null;
  license?: string | null;
  license_version?: string | null;
  foreign_landing_url?: string | null;
  width?: number | null;
  height?: number | null;
  source?: string | null;
  tags?: Array<{ name?: string | null }>;
};

type OpenverseResponse = {
  results?: OpenverseImage[];
};

const ALLOWED_IMAGE_HOSTS = new Set([
  "live.staticflickr.com",
  "upload.wikimedia.org",
]);

const REJECT_WORDS =
  /\b(bottle|label|logo|menu|poster|sign|building|bar exterior|person|people|portrait|recipe card|book|advertisement|ingredient|ingredients)\b/i;

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string) {
  return normalize(value).replace(/\s+/g, "");
}

function cleanOpenverseUrl(value: string | null | undefined) {
  return (value || "").replace(/^<|>$/g, "");
}

function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function clearlyDepictsNamedDrink(image: OpenverseImage, cocktailName: string) {
  const title = image.title || "";
  const normalizedTitle = normalize(title);
  const normalizedName = normalize(cocktailName);
  const compactTitle = compact(title);
  const compactName = compact(cocktailName);
  const normalizedTags = (image.tags || [])
    .map((tag) => normalize(tag.name || ""))
    .filter(Boolean)
    .join(" ");
  const evidence = `${normalizedTitle} ${normalizedTags}`;

  if (!normalizedName || compactName.length < 4 || REJECT_WORDS.test(evidence)) return false;
  const nameIndex = compactTitle.indexOf(compactName);
  if (nameIndex < 0 || nameIndex > 8) return false;

  return /\b(cocktail|cocktails|drink|drinks|drinking|beverage|alcohol|served|glass|cooler|highball|fizz|sour|punch|bartending)\b/i.test(
    evidence,
  );
}

function qualityScore(image: OpenverseImage, cocktailName: string) {
  const title = image.title || "";
  const width = image.width || 0;
  const height = image.height || 0;
  const normalizedTitle = normalize(title);
  const normalizedName = normalize(cocktailName);
  let score = Math.min(20, Math.log2(Math.max(1, width * height)) - 16);
  if (normalizedTitle === normalizedName) score += 20;
  if (normalizedTitle === `${normalizedName} cocktail`) score += 18;
  if (normalizedTitle.startsWith(normalizedName)) score += 10;
  if (image.source === "flickr") score += 2;
  return score;
}

/**
 * Search openly licensed photography, accepting only clear images whose title
 * explicitly names this cocktail. Results are commercially usable and retain
 * their required creator/license attribution.
 */
export async function fetchOpenverseCocktailPhotos(
  name: string,
  limit = 5,
): Promise<GalleryImage[]> {
  const params = new URLSearchParams({
    q: name,
    page_size: "20",
    mature: "false",
    license_type: "commercial",
    size: "large",
    filter_dead: "true",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Cocktale/1.0 (https://github.com/hxyan2020/Cocktale)",
      },
      next: { revalidate: 2_592_000 },
      signal: controller.signal,
    });
    if (!response.ok) return [];

    const data = (await response.json()) as OpenverseResponse;
    const candidates = (data.results || [])
      .filter((image) => {
        const width = image.width || 0;
        const height = image.height || 0;
        const url = cleanOpenverseUrl(image.url);
        return (
          width >= 1000 &&
          height >= 800 &&
          width * height >= 1_000_000 &&
          isAllowedImageUrl(url) &&
          clearlyDepictsNamedDrink(image, name)
        );
      })
      .sort((a, b) => qualityScore(b, name) - qualityScore(a, name));

    const seen = new Set<string>();
    const photos: GalleryImage[] = [];
    for (const image of candidates) {
      const url = cleanOpenverseUrl(image.url);
      const canonicalUrl = url.replace(/[?#].*$/, "");
      if (seen.has(canonicalUrl)) continue;
      seen.add(canonicalUrl);

      const creator = image.creator?.trim() || "Openverse contributor";
      const license = [image.license?.toUpperCase(), image.license_version]
        .filter(Boolean)
        .join(" ");
      photos.push({
        id: `openverse-${image.id}`,
        url,
        alt: `${name} — ${image.title || "cocktail photo"}`,
        label: name,
        width: image.width || undefined,
        height: image.height || undefined,
        credit: creator,
        creditUrl: cleanOpenverseUrl(image.foreign_landing_url),
        license,
      });
      if (photos.length >= limit) break;
    }

    return photos;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
