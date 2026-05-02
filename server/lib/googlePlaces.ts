import { haversine } from "./geo";
import { hash } from "./hash";
import { filterExcluded } from "./spotExclude";
import type { SpotResult } from "./spotResult";
import type { DestinyMode } from "./wikiPlaces";
import { env } from "./env";

function filterByMode(places: SpotResult[], mode: DestinyMode | null): SpotResult[] {
  if (!mode) return places;
  if (mode === "near") return places.filter((p) => (p.dist || 0) <= 1200);
  if (mode === "mid") return places.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
  if (mode === "far") return places.filter((p) => (p.dist || 0) > 5500);
  return places;
}

export async function fetchGooglePlacesSpotServer(
  lat: number,
  lng: number,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[] = [],
): Promise<SpotResult | null> {
  const key = env.googleMapsApiKey;
  if (!key) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "25000");
  url.searchParams.set("keyword", "park museum garden landmark waterfront");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      results?: {
        name?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
      }[];
    };
    if (!["OK", "ZERO_RESULTS"].includes(data.status || "")) return null;
    const places = (data.results || [])
      .map((r) => ({
        name: String(r.name || "").trim(),
        lat: r.geometry?.location?.lat ?? null,
        lng: r.geometry?.location?.lng ?? null,
      }))
      .filter((r) => r.name && r.lat != null && r.lng != null)
      .map((r) => ({
        name: r.name,
        lat: r.lat as number,
        lng: r.lng as number,
        dist: Math.round(haversine(lat, lng, r.lat as number, r.lng as number) * 1000),
        type: "urban",
      }));

    if (!places.length) return null;
    let pool = filterExcluded(filterByMode(places, mode), excludeNames);
    let fallback = false;
    if (!pool.length) {
      pool = filterExcluded(places, excludeNames);
      fallback = true;
    }
    if (!pool.length) return null;

    const h = hash(`${lat.toFixed(4)},${lng.toFixed(4)},gmap,${seed},${mode || "any"},r${rollId}`);
    const pick = pool[h % pool.length];
    return pick ? { ...pick, fallback } : null;
  } catch {
    return null;
  }
}
