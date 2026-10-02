/**
 * Trademarks and house names that machine translation turns into common words
 * ("7-up" → "7 向上", "Sprite" → "精灵", "Corona" → "日冕").
 * Longer phrases are matched first. Generic words (rum, vodka, bitters) stay translatable.
 */
export const PROTECTED_TERMS = [
  "Schweppes Russchian",
  "Amaro Montenegro",
  "Chambord raspberry liqueur",
  "Midori melon liqueur",
  "Baileys irish cream",
  "Southern Comfort",
  "Johnnie Walker",
  "Dubonnet Rouge",
  "Absolut Citron",
  "Absolut Kurant",
  "Absolut Peppar",
  "Absolut Vodka",
  "Bacardi Limon",
  "Crown Royal",
  "Green Chartreuse",
  "Yellow Chartreuse",
  "Grand Marnier",
  "Jack Daniels",
  "Jack Daniel's",
  "Jim Beam",
  "Lillet Blanc",
  "Mountain Dew",
  "Pepsi Cola",
  "Rumple Minze",
  "St. Germain",
  "Tia Maria",
  "Wild Turkey",
  "Yukon Jack",
  "Black Sambuca",
  "Coca-Cola",
  "Coca Cola",
  "Goldschlager",
  "Hot Damn",
  "Kool-Aid",
  "Pisang Ambon",
  "7-up",
  "7 Up",
  "7-Up",
  "7up",
  "Absolut",
  "Advocaat",
  "Angostura",
  "Aperol",
  "Apfelkorn",
  "Bacardi",
  "Baileys",
  "Benedictine",
  "Campari",
  "Chambord",
  "Chartreuse",
  "Cointreau",
  "Cocktale",
  "Corona",
  "Drambuie",
  "Dubonnet",
  "Everclear",
  "Frangelico",
  "Fresca",
  "Galliano",
  "Godiva",
  "Google",
  "Guinness",
  "Jagermeister",
  "Jägermeister",
  "Jello",
  "Kahlua",
  "Kahlúa",
  "Lillet",
  "Malibu",
  "Midori",
  "Oreo",
  "Ouzo",
  "Passoa",
  "Pepsi",
  "Pernod",
  "Peychaud",
  "Peachtree",
  "Ricard",
  "Sambuca",
  "Schweppes",
  "Sprite",
  "Stripe",
  "Surge",
  "Tabasco",
  "Tia maria",
  "Zima",
  "BarForge",
  "ClearCraft",
  "GroveBar",
  "NorthFreeze",
  "PulseBar",
];

export type ProtectedPart = { locked: boolean; text: string };

function isWordChar(char: string) {
  return /[\p{L}\p{N}]/u.test(char);
}

const TERMS_BY_LENGTH = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length || a.localeCompare(b));

/** Split text so trademark spans stay verbatim and the rest can be translated. */
export function splitProtected(text: string): ProtectedPart[] {
  const lower = text.toLowerCase();
  const hits: Array<{ start: number; end: number }> = [];

  for (const term of TERMS_BY_LENGTH) {
    const needle = term.toLowerCase();
    if (!needle) continue;
    let from = 0;
    while (from <= lower.length - needle.length) {
      const start = lower.indexOf(needle, from);
      if (start < 0) break;
      const end = start + needle.length;
      const beforeOk = start === 0 || !isWordChar(text[start - 1] ?? "");
      const afterOk = end === text.length || !isWordChar(text[end] ?? "");
      const overlaps = hits.some((hit) => start < hit.end && end > hit.start);
      if (beforeOk && afterOk && !overlaps) hits.push({ start, end });
      from = start + needle.length;
    }
  }

  hits.sort((a, b) => a.start - b.start);
  const parts: ProtectedPart[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) parts.push({ locked: false, text: text.slice(cursor, hit.start) });
    parts.push({ locked: true, text: text.slice(hit.start, hit.end) });
    cursor = hit.end;
  }
  if (cursor < text.length) parts.push({ locked: false, text: text.slice(cursor) });
  if (parts.length === 0) parts.push({ locked: false, text });
  return parts;
}

export function needsTranslation(part: ProtectedPart) {
  return !part.locked && /[A-Za-z]/.test(part.text);
}
