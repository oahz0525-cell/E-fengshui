import { create } from 'zustand';
import type {
  Goal, Element, Location, BaziResult, XiShen, DestinyMode,
  Environment, SubScores, CalcResult, Spot, Page, City,
} from '@/types';
import { XI_SHEN } from '@/data/elements';

interface AppState {
  page: Page;
  goal: Goal | null;
  location: Location | null;
  stem: string;
  element: Element;
  bazi: BaziResult | null;
  xiShen: XiShen;
  weather: string;
  userHeading: number | null;
  bestDir: string;
  score: number;
  scoreComment: string;
  subScores: SubScores;
  env: Environment | null;
  city: City | null;
  wikiLang: string;
  floor: number;

  // UI
  isLoading: boolean;

  // Destiny
  destinyMode: DestinyMode | null;
  destinySpot: Spot | null;

  // Actions
  setPage: (p: Page) => void;
  setGoal: (g: Goal) => void;
  setLocation: (l: Location) => void;
  setStem: (s: string, el: Element) => void;
  setBazi: (b: BaziResult, el: Element) => void;
  setWeather: (w: string) => void;
  setUserHeading: (h: number) => void;
  setCalcResult: (r: CalcResult) => void;
  setEnv: (e: Environment) => void;
  setCity: (c: City | null) => void;
  setWikiLang: (l: string) => void;
  setFloor: (f: number) => void;
  setLoading: (v: boolean) => void;
  setDestinyMode: (m: DestinyMode) => void;
  setDestinySpot: (s: Spot | null) => void;
  resetDestiny: () => void;
  goToResult: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  page: 'landing',
  goal: null,
  location: null,
  stem: '',
  element: '木',
  bazi: null,
  xiShen: XI_SHEN['木'],
  weather: 'clear',
  userHeading: null,
  bestDir: '',
  score: 0,
  scoreComment: '',
  subScores: { wealth: 50, creative: 50, sleep: 50, social: 50 },
  env: null,
  city: null,
  wikiLang: '',
  floor: 1,

  isLoading: false,

  destinyMode: null,
  destinySpot: null,

  setPage: (p) => set({ page: p }),
  setGoal: (g) => set({ goal: g }),
  setLocation: (l) => set({ location: l }),
  setStem: (s, el) => set({ stem: s, element: el, xiShen: XI_SHEN[el] }),
  setBazi: (b, el) => set({ bazi: b, element: el, stem: b.dm, xiShen: XI_SHEN[el] }),
  setWeather: (w) => set({ weather: w }),
  setUserHeading: (h) => set({ userHeading: h }),
  setCalcResult: (r) => set({
    score: r.score, bestDir: r.dir, scoreComment: r.comment,
    subScores: r.subScores, env: r.env, xiShen: r.xi,
  }),
  setEnv: (e) => set({ env: e }),
  setCity: (c) => set({ city: c }),
  setWikiLang: (l) => set({ wikiLang: l }),
  setFloor: (f) => set({ floor: f }),
  setLoading: (v) => set({ isLoading: v }),
  setDestinyMode: (m) => set({ destinyMode: m }),
  setDestinySpot: (s) => set({ destinySpot: s }),
  resetDestiny: () => set({ destinyMode: null, destinySpot: null }),
  goToResult: () => set({ page: 'result' }),
}));
