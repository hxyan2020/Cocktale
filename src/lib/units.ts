export type MeasureUnit = "oz" | "ml" | "cl";

export const MEASURE_UNITS: MeasureUnit[] = ["oz", "ml", "cl"];

const STORAGE_KEY = "cocktale:measureUnit";

/** US fluid ounce used by most cocktail recipes in TheCocktailDB. */
const ML_PER_OZ = 29.5735;
const ML_PER_CL = 10;

const FRACTIONS: [number, string][] = [
  [0.125, "1/8"],
  [0.25, "1/4"],
  [0.333, "1/3"],
  [0.375, "3/8"],
  [0.5, "1/2"],
  [0.625, "5/8"],
  [0.666, "2/3"],
  [0.75, "3/4"],
  [0.875, "7/8"],
];

const UNICODE_FRAC: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

function normalizeFractions(raw: string): string {
  return raw.replace(/[½⅓⅔¼¾⅛⅜⅝⅞]/g, (ch) => UNICODE_FRAC[ch] ?? ch);
}

function parseMixedNumber(raw: string): number | null {
  const s = normalizeFractions(raw.trim());

  // "1 1/2", "1½" (normalized), or "1-1/2"
  const mixed = s.match(/^(\d+)\s*-?\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }

  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);

  const dec = s.match(/^(\d+(?:\.\d+)?)$/);
  if (dec) return Number(dec[1]);

  return null;
}

type ParsedMeasure = {
  amountMl: number;
  prefix: string;
  suffix: string;
};

/**
 * Extract a convertible volume from free-text measures like "1 1/2 oz", "50 ml", "3 cl juice".
 * Qualitative measures (twist, dash, splash, cube) are left unchanged.
 */
export function parseMeasureToMl(measure: string): ParsedMeasure | null {
  const text = measure.trim();
  if (!text) return null;

  // Prefer glued unicode fractions (1½) before bare digits so "1½ oz" is not "1" + "½ oz".
  const unitRe =
    /^(.*?)(\d+\s*[½⅓⅔¼¾⅛⅜⅝⅞]|\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅛⅜⅝⅞])\s*(fl\.?\s*)?(oz|ounces?|ml|milliliters?|millilitres?|cl|centiliters?|centilitres?|shot|shots|tsp|teaspoons?|tbsp|tablespoons?)\b(.*)$/i;

  const m = text.match(unitRe);
  if (!m) return null;

  const prefix = m[1].trim();
  const amount = parseMixedNumber(m[2]);
  if (amount == null || amount <= 0) return null;
  const unit = (m[4] || "").toLowerCase();
  const suffix = (m[5] || "").trim();

  let amountMl = amount;
  if (/^oz|ounce/.test(unit)) amountMl = amount * ML_PER_OZ;
  else if (/^cl|centi/.test(unit)) amountMl = amount * ML_PER_CL;
  else if (/^ml|milli/.test(unit)) amountMl = amount;
  else if (/^shot/.test(unit)) amountMl = amount * 1.5 * ML_PER_OZ;
  else if (/^tsp|tea/.test(unit)) amountMl = amount * 4.92892;
  else if (/^tbsp|table/.test(unit)) amountMl = amount * 14.7868;
  else return null;

  // Don't convert weird prefixes like "juice of"
  if (/juice of|twist|wedge|slice|cube|dash|splash|pinch|drop|part|parts|fill|top/i.test(text) && !/\b(oz|ml|cl)\b/i.test(text)) {
    return null;
  }

  return { amountMl, prefix, suffix };
}

function formatOz(ml: number): string {
  const oz = ml / ML_PER_OZ;
  const whole = Math.floor(oz + 1e-6);
  const fracPart = oz - whole;

  let fracLabel = "";
  let bestDiff = 0.04;
  for (const [v, label] of FRACTIONS) {
    const d = Math.abs(fracPart - v);
    if (d < bestDiff) {
      bestDiff = d;
      fracLabel = label;
    }
  }

  if (Math.abs(fracPart) < 0.04) {
    return `${whole || (oz < 0.04 ? "0" : whole)}`;
  }
  if (whole === 0) return fracLabel || oz.toFixed(2).replace(/\.?0+$/, "");
  if (fracLabel) return `${whole} ${fracLabel}`;
  return oz.toFixed(2).replace(/\.?0+$/, "");
}

function formatMetric(ml: number, unit: "ml" | "cl"): string {
  if (unit === "cl") {
    const cl = ml / ML_PER_CL;
    const rounded = Math.round(cl * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
  const rounded = Math.round(ml);
  return String(rounded);
}

export function convertMeasure(measure: string | null, unit: MeasureUnit): string {
  if (!measure || !measure.trim()) return measure || "";
  const parsed = parseMeasureToMl(measure);
  if (!parsed) return measure;

  const { amountMl, prefix, suffix } = parsed;
  let body = "";
  if (unit === "oz") body = `${formatOz(amountMl)} oz`;
  else if (unit === "cl") body = `${formatMetric(amountMl, "cl")} cl`;
  else body = `${formatMetric(amountMl, "ml")} ml`;

  return [prefix, body, suffix].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function getStoredMeasureUnit(): MeasureUnit {
  if (typeof window === "undefined") return "oz";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "oz" || v === "ml" || v === "cl") return v;
  } catch {
    /* ignore */
  }
  return "oz";
}

export function setStoredMeasureUnit(unit: MeasureUnit) {
  localStorage.setItem(STORAGE_KEY, unit);
}
