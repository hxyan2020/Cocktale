const PROMPT_DAY_KEY = "cocktale:location-prompt-day";
export const LOCATION_COORDS_KEY = "cocktale:recommendation-location";

export type CachedCoords = { lat: number; lon: number };

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function wasLocationAskedToday(): boolean {
  try {
    return localStorage.getItem(PROMPT_DAY_KEY) === localDayKey();
  } catch {
    return false;
  }
}

export function markLocationAskedToday(): void {
  try {
    localStorage.setItem(PROMPT_DAY_KEY, localDayKey());
  } catch {
    // Ignore storage failures; prompts still work without persistence.
  }
}

export function readCachedCoords(): CachedCoords | null {
  try {
    const raw =
      localStorage.getItem(LOCATION_COORDS_KEY) ?? sessionStorage.getItem(LOCATION_COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedCoords>;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lon === "number" &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lon)
    ) {
      return { lat: parsed.lat, lon: parsed.lon };
    }
  } catch {
    // Fall through.
  }
  return null;
}

export function writeCachedCoords(coords: CachedCoords): void {
  const payload = JSON.stringify(coords);
  try {
    localStorage.setItem(LOCATION_COORDS_KEY, payload);
  } catch {
    // Ignore.
  }
  try {
    sessionStorage.setItem(LOCATION_COORDS_KEY, payload);
  } catch {
    // Ignore.
  }
}

export async function readGeolocationPermission(): Promise<PermissionState | "unknown"> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return "unknown";
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    return permission.state;
  } catch {
    return "unknown";
  }
}
