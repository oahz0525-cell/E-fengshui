import type { Element, Goal, Location, Environment, XiShen, CalcResult } from '@/types';
import { GOAL_DIR, EL_DIR } from '@/data/elements';
import { hash } from '@/utils/hash';
import { clamp } from '@/utils/hash';

export function genEnv(loc: Location, floor = 1): Environment {
  const h = hash(`${loc.lat.toFixed(5)},${loc.lng.toFixed(5)},${new Date().getDate()}`);
  const h2 = hash(`${loc.lng.toFixed(5)},${loc.lat.toFixed(5)},${new Date().getDate() + 1}`);

  // Base environment
  const baseDensity = ((h2 % 100) / 100);
  const baseNoise = ((h2 * 3) % 100) / 100;
  const baseOpen = 1 - ((h2 * 2) % 100) / 100;

  // Altitude effects (per floor above ground)
  // Temp drops ~0.3°C per floor; wind rises ~0.5m/s per 10 floors
  // Noise drops ~4% per 5 floors; openness increases
  const altitudeTemp = Math.round(floor * 0.3 * 10) / 10;
  const windSpeed = Math.round((2 + (h2 % 5) * 0.3 + floor * 0.05) * 10) / 10;
  const noiseMod = Math.max(0.15, baseNoise - floor * 0.008);
  const openMod = Math.min(0.95, baseOpen + floor * 0.005);
  const densityMod = Math.max(0.1, baseDensity - floor * 0.003);

  return {
    waterDist: 150 + h % 1000, parkDist: 80 + (h * 7) % 900,
    roadDist: 30 + (h * 3) % 500, metroDist: 50 + (h * 11) % 1200,
    cemeteryDist: 400 + (h * 13) % 3000, hospitalDist: 200 + (h * 5) % 1500,
    schoolDist: 150 + (h * 17) % 1000,
    buildingDensity: densityMod,
    openness: openMod,
    noiseLevel: noiseMod,
    trafficDensity: ((h2 * 5) % 100) / 100,
    sunriseDir: '东', sunsetDir: '西',
    floor,
    altitudeTemp,
    windSpeed,
  };
}

export function divineWeather(lat: number, lng: number): string {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const h = hash(`${lat.toFixed(4)},${lng.toFixed(4)},${month},${day}`);
  let conds: string[];
  if (month >= 6 && month <= 8) conds = ['clear', 'cloudy', 'rain', 'thunder'];
  else if (month >= 12 || month <= 2) conds = ['clear', 'cloudy', 'snow', 'wind'];
  else conds = ['clear', 'cloudy', 'rain', 'wind', 'fog'];
  return conds[(h + Math.floor((lat + 90) / 30) * 7 + Math.floor((lng + 180) / 60) * 3) % conds.length];
}

export function calcResult(el: Element, goal: Goal, env: Environment, xi: XiShen): CalcResult {
  let score = 50;
  const subs = { wealth: 50, creative: 50, sleep: 50, social: 50 };
  const hour = new Date().getHours();
  score += 5; // default weather boost

  // Hour
  if (hour >= 5 && hour <= 9) { score += 7; subs.creative += 8; subs.wealth += 5; }
  else if (hour >= 11 && hour <= 13) { score += 5; subs.social += 6; subs.wealth += 4; }
  else if (hour >= 17 && hour <= 19) { score += 4; subs.wealth += 5; }
  else if (hour >= 21 || hour <= 3) { score += goal === 'sleep' ? 14 : -7; subs.sleep += goal === 'sleep' ? 15 : -5; }

  // Xi shen
  if (xi.xi.includes('水') && env.waterDist < 500) { score += 10; subs.creative += 8; subs.wealth += 6; }
  if (xi.xi.includes('木') && env.parkDist < 400) { score += 10; subs.creative += 10; subs.social += 4; }
  if (xi.xi.includes('火')) { score += 8; subs.social += 8; subs.wealth += 5; }
  if (xi.xi.includes('土') && env.buildingDensity > 0.5) { score += 8; subs.wealth += 6; subs.sleep += 4; }
  if (xi.xi.includes('金') && env.noiseLevel > 0.4) { score += 6; subs.wealth += 8; }

  // Negative
  if (env.roadDist < 150) { score -= 7; subs.sleep -= 10; subs.creative -= 4; }
  if (env.metroDist < 200) { score -= 5; subs.sleep -= 8; }
  if (env.openness > 0.6) { score += 4; subs.creative += 6; subs.social += 5; }
  if (env.buildingDensity > 0.7) { score -= 3; subs.creative -= 4; subs.sleep -= 3; }

  // Goal
  if (goal === 'wealth') { score += subs.wealth * 0.1; subs.wealth += 8; }
  if (goal === 'creation') { score += subs.creative * 0.1; subs.creative += 8; }
  if (goal === 'sleep') { score += subs.sleep * 0.1; subs.sleep += 8; }
  if (goal === 'social') { score += subs.social * 0.1; subs.social += 8; }
  if (goal === 'emotion') { score += 5; subs.sleep += 5; subs.creative += 3; }

  score = clamp(score, 18, 98);
  for (const k in subs) (subs as any)[k] = clamp((subs as any)[k], 10, 99);

  const dir = GOAL_DIR[goal] || EL_DIR[el] || '东';
  const comment = score >= 85 ? '今日气场极佳，万事俱备，只管向前' :
    score >= 70 ? '气韵通达，顺势而为即可' :
    score >= 55 ? '气场平稳，微作调整便能改观' : '今日气场略有阻滞，宜静不宜动，开运指南尤需细看';

  return { score: Math.round(score), dir, comment, subScores: subs, env, xi };
}
