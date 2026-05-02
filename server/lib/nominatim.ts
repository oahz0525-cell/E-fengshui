import { fetchWithTimeout, EXTERNAL_FETCH_MS } from "./fetchTimeout";

export interface CityInfoResult {
  name: string;
  country: string;
  display: string;
  countryCode: string;
}

async function fetchNominatimReverse(lat: number, lng: number): Promise<CityInfoResult | null> {
  try {
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en,zh`,
      {
        headers: {
          "User-Agent": "ElectronicFengshui/1.0 (portfolio demo; local deploy)",
        },
      },
      EXTERNAL_FETCH_MS,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      display_name?: string;
      address?: Record<string, string>;
    };
    const addr = data.address || {};
    let name = data.name || addr.city || addr.town || addr.municipality || addr.county || addr.state || "";
    name = name.split(/[;；]/)[0].trim();
    let country = addr.country || "";
    country = country.split(/[;；]/)[0].trim();
    let display = (data.display_name || name || "").split(/[;；]/)[0].trim();
    const countryCode = (addr.country_code || "").toUpperCase();
    if (name && display) {
      return { name, country, display, countryCode };
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function fetchPhotonCity(lat: number, lng: number): Promise<CityInfoResult | null> {
  try {
    const res = await fetchWithTimeout(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=en`,
      { headers: { Accept: "application/json" } },
      EXTERNAL_FETCH_MS,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: { properties?: Record<string, string | undefined> }[];
    };
    const p = data.features?.[0]?.properties;
    if (!p) return null;
    const city = (p.city || p.name || p.locality || p.county || "") as string;
    const country = (p.country || "") as string;
    const name = city || (p.name as string) || "此地";
    const countryCode = ((p.countrycode as string) || "").toUpperCase();
    const display = [city || p.name, p.state, country].filter(Boolean).join(" · ");
    return { name: String(name).trim(), country: String(country).trim(), display: display || name, countryCode };
  } catch {
    return null;
  }
}

/** Nominatim 与 Photon 并行，优先采用 Nominatim 结果 */
export async function fetchCityInfoServer(lat: number, lng: number): Promise<CityInfoResult | null> {
  const [nom, photon] = await Promise.all([
    fetchNominatimReverse(lat, lng),
    fetchPhotonCity(lat, lng),
  ]);
  return nom ?? photon ?? null;
}
