import type { City } from '@/types';
import { PRESET_CITIES } from '@contracts/presetCities';

/** 与 `@contracts/presetCities` 同源，供 UI / 城市诊断等使用 */
export const CITIES: City[] = PRESET_CITIES as City[];
