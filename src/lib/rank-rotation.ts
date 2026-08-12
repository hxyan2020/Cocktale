const PREFIX = "cocktale:rankOffset:";

function key(userId: string, surface: string) {
  return `${PREFIX}${userId}:${surface}`;
}

export function getRankOffset(userId: string, surface: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(localStorage.getItem(key(userId, surface)) || "0");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function setRankOffset(userId: string, surface: string, offset: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(userId, surface), String(Math.max(0, Math.floor(offset))));
}

/** Move previously shown items to the end so the next visit starts further down the ranked list. */
export function rotateRanked<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const i = ((offset % items.length) + items.length) % items.length;
  if (i === 0) return items;
  return [...items.slice(i), ...items.slice(0, i)];
}

export function advanceRankOffset(
  userId: string,
  surface: string,
  by: number,
  total: number,
): number {
  if (total <= 0) return 0;
  const next = (getRankOffset(userId, surface) + Math.max(1, by)) % total;
  setRankOffset(userId, surface, next);
  return next;
}

/** Advance once per visit; ignores remounts within a few seconds (React Strict Mode). */
export function maybeAdvanceRankOffset(
  userId: string,
  surface: string,
  by: number,
  total: number,
): number {
  if (typeof window === "undefined" || total <= 0) return getRankOffset(userId, surface);
  const stampKey = `${key(userId, surface)}:at`;
  try {
    const last = Number(sessionStorage.getItem(stampKey) || "0");
    if (Date.now() - last < 4000) return getRankOffset(userId, surface);
    sessionStorage.setItem(stampKey, String(Date.now()));
  } catch {
    /* ignore */
  }
  return advanceRankOffset(userId, surface, by, total);
}
