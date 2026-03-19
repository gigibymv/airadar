export const BRIEFING_REGIONS = [
  { id: "africa", label: "Africa" },
  { id: "se-asia", label: "SE Asia" },
  { id: "europe", label: "Europe" },
  { id: "latam", label: "LATAM" },
  { id: "middle-east", label: "Middle East" },
] as const;

export type BriefingRegion = (typeof BRIEFING_REGIONS)[number]["id"];

export const DEFAULT_REGION: BriefingRegion = "africa";

export const REGION_STORAGE_KEY = "ai-radar-briefing-region";

export function getRegionLabel(region: BriefingRegion): string {
  return BRIEFING_REGIONS.find((r) => r.id === region)?.label ?? region;
}

export function isValidRegion(value: unknown): value is BriefingRegion {
  return BRIEFING_REGIONS.some((r) => r.id === value);
}

export function loadStoredRegion(): BriefingRegion {
  try {
    const stored = localStorage.getItem(REGION_STORAGE_KEY);
    if (stored && isValidRegion(stored)) return stored;
  } catch {
    // localStorage unavailable (SSR, incognito restrictions)
  }
  return DEFAULT_REGION;
}

export function saveRegion(region: BriefingRegion): void {
  try {
    localStorage.setItem(REGION_STORAGE_KEY, region);
  } catch {
    // ignore
  }
}
