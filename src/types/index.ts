export type Goal = 'creation' | 'study' | 'sleep' | 'wealth' | 'emotion' | 'social';
export type Element = '木' | '火' | '土' | '金' | '水';
export type DestinyMode = 'near' | 'mid' | 'far';
export type Page = 'landing' | 'input' | 'result';

export interface Stem {
  n: string;
  el: Element;
  c: string;
  y: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface BaziResult {
  yG: string; yZ: string;
  mG: string; mZ: string;
  dG: string; dZ: string;
  hG: string; hZ: string;
  dm: string;
}

export interface XiShen {
  xi: Element[];
  ji: Element[];
  desc: string;
}

export interface City {
  name: string;
  lat: number;
  lng: number;
  radius: number;
  el: Element;
  desc: string;
  spots: Spot[];
}

export interface Spot {
  name: string;
  lat: number;
  lng: number;
  el?: string;
  poem?: string;
  type?: string;
  dist?: number;
  fallback?: boolean;
}

export interface Environment {
  waterDist: number;
  parkDist: number;
  roadDist: number;
  metroDist: number;
  cemeteryDist: number;
  hospitalDist: number;
  schoolDist: number;
  buildingDensity: number;
  openness: number;
  noiseLevel: number;
  trafficDensity: number;
  sunriseDir: string;
  sunsetDir: string;
  floor: number;
  altitudeTemp: number;
  windSpeed: number;
}

export interface Weather {
  name: string;
  desc: string;
  icon: string;
}

export interface SubScores {
  wealth: number;
  creative: number;
  sleep: number;
  social: number;
}

export interface CalcResult {
  score: number;
  dir: string;
  comment: string;
  subScores: SubScores;
  env: Environment;
  xi: XiShen;
}

export interface CityInfo {
  name: string;
  country: string;
  display: string;
  countryCode: string;
}

export interface DestinyState {
  swaps: number;
  currentSpot: Spot | null;
  mode: DestinyMode | null;
  spotsPool: Spot[];
}

