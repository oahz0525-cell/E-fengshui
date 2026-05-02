/** Mirrors `Spot` in `src/types/index.ts` for API responses */
export interface SpotResult {
  name: string;
  lat: number;
  lng: number;
  el?: string;
  poem?: string;
  type?: string;
  dist?: number;
  fallback?: boolean;
}
