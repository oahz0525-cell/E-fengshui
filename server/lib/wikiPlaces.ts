import { fetchWithTimeout, EXTERNAL_FETCH_MS } from "./fetchTimeout";
import { hash } from "./hash";
import { WIKI_LANG_MAP } from "./placesData";
import { filterExcluded } from "./spotExclude";
import type { SpotResult } from "./spotResult";

export type DestinyMode = "near" | "mid" | "far";

function inferWikiType(title: string): string {
  const t = title.toLowerCase();
  if (/park|garden|forest|arboretum|botanical/.test(t)) return "park";
  if (/river|lake|beach|water|fountain|harbor|bay/.test(t)) return "water";
  if (/hill|mountain|peak|view|tower|observatory|skyscraper/.test(t)) return "viewpoint";
  if (/church|temple|mosque|shrine|cathedral|historic|museum|monument|memorial|cemetery|ruins/.test(t))
    return "monument";
  if (/square|plaza|market|hall|station|terminal|bridge|building|center|library/.test(t))
    return "urban";
  return "default";
}

export async function fetchWikiSpotsServer(
  lat: number,
  lng: number,
  wikiLang: string,
  mode: DestinyMode | null,
  seed: number,
  rollId: number,
  excludeNames: string[] = [],
): Promise<SpotResult | null> {
  try {
    const lang = WIKI_LANG_MAP[wikiLang] || "en";
    const res = await fetchWithTimeout(
      `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=25000&gscoord=${lat}|${lng}&gslimit=50&format=json&origin=*`,
      undefined,
      EXTERNAL_FETCH_MS,
    );
    if (!res.ok) throw new Error("Wiki error");
    const data = (await res.json()) as {
      query?: { geosearch?: { title: string; lat: number; lon: number; dist: number }[] };
    };
    const places = data.query?.geosearch || [];
    if (places.length === 0) return null;

    const badTitle = (t: string) =>
      /^(climate|demographics|economy|history|geography)\s+of\b/i.test(t) ||
      /^list of\b/i.test(t) ||
      /\btimeline of\b/i.test(t);

    const landmarks = places
      .filter((p) => {
        const t = p.title.trim();
        return !badTitle(t) && p.dist >= 0;
      })
      .map((p) => ({
        name: p.title,
        lat: p.lat,
        lng: p.lon,
        dist: p.dist,
        type: inferWikiType(p.title),
      }));

    if (landmarks.length === 0) return null;

    let pool = filterExcluded(landmarks, excludeNames);
    let fallback = false;
    if (mode === "near") pool = pool.filter((p) => (p.dist || 0) <= 1200);
    else if (mode === "mid")
      pool = pool.filter((p) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
    else if (mode === "far") pool = pool.filter((p) => (p.dist || 0) > 5500);
    if (pool.length === 0) {
      pool = filterExcluded(landmarks, excludeNames);
      fallback = true;
    }
    if (pool.length === 0) return null;

    const h = hash(
      `${lat.toFixed(4)},${lng.toFixed(4)},${new Date().getDate()},${seed},${mode || "any"},r${rollId}`,
    );
    const pick = pool[h % pool.length];
    if (!pick) return null;
    return { ...pick, fallback, dist: Math.round(pick.dist || 0) };
  } catch {
    return null;
  }
}
