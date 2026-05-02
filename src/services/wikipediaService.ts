import type { Spot, DestinyMode } from '@/types';
import { hash } from '@/utils/hash';
import { WIKI_LANG_MAP } from '@/data/elements';

export async function fetchWikiSpots(
  lat: number, lng: number, wikiLang: string, mode: DestinyMode | null, seed: number
): Promise<Spot | null> {
  try {
    const lang = WIKI_LANG_MAP[wikiLang] || 'en';
    const res = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=25000&gscoord=${lat}|${lng}&gslimit=50&format=json&origin=*`
    );
    if (!res.ok) throw new Error('Wiki error');
    const data = await res.json();
    const places = data.query?.geosearch || [];
    if (places.length === 0) return null;

    const landmarks = places
      .filter((p: any) => {
        const t = p.title.toLowerCase();
        const exclude = ['climate of', 'demographics of', 'economy of', 'history of', 'geography of', 'list of', 'borough of', 'district'];
        return !exclude.some((e: string) => t.includes(e)) && p.dist > 100;
      })
      .map((p: any) => ({
        name: p.title,
        lat: p.lat,
        lng: p.lon,
        dist: p.dist,
        type: inferWikiType(p.title),
      }));

    if (landmarks.length === 0) return null;

    let pool = landmarks;
    let fallback = false;
    if (mode === 'near') pool = landmarks.filter((p: Spot) => (p.dist || 0) <= 1200);
    else if (mode === 'mid') pool = landmarks.filter((p: Spot) => (p.dist || 0) > 1200 && (p.dist || 0) <= 5500);
    else if (mode === 'far') pool = landmarks.filter((p: Spot) => (p.dist || 0) > 5500);
    if (pool.length === 0) { pool = landmarks; fallback = true; }

    const h = hash(`${lat.toFixed(4)},${lng.toFixed(4)},${new Date().getDate()},${seed},${mode || 'any'}`);
    const pick = pool[h % pool.length];
    pick.fallback = fallback;
    pick.dist = Math.round(pick.dist || 0);
    return pick;
  } catch { return null; }
}

function inferWikiType(title: string): string {
  const t = title.toLowerCase();
  if (/park|garden|forest|arboretum|botanical/.test(t)) return 'park';
  if (/river|lake|beach|water|fountain|harbor|bay/.test(t)) return 'water';
  if (/hill|mountain|peak|view|tower|observatory|skyscraper/.test(t)) return 'viewpoint';
  if (/church|temple|mosque|shrine|cathedral|historic|museum|monument|memorial|cemetery|ruins/.test(t)) return 'monument';
  if (/square|plaza|market|hall|station|terminal|bridge|building|center|library/.test(t)) return 'urban';
  return 'default';
}
