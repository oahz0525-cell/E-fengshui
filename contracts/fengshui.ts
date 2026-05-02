// Shared types for fengshui engine (frontend + backend)

export type Goal = 'creation' | 'study' | 'sleep' | 'wealth' | 'emotion' | 'social';
export type Element = '木' | '火' | '土' | '金' | '水';

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

export interface Location {
  lat: number;
  lng: number;
}

export interface Weather {
  name: string;
  desc: string;
  icon: string;
}
