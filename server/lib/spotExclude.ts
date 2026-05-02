/** Stable key for deduping / excluding the same place across draws */
export function normalizeSpotName(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function filterExcluded<T extends { name: string }>(places: T[], excludeNames: string[]): T[] {
  if (!excludeNames.length) return places;
  const set = new Set(excludeNames.map(normalizeSpotName).filter(Boolean));
  return places.filter((p) => !set.has(normalizeSpotName(p.name)));
}
