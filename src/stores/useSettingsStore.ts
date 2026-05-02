import { create } from 'zustand';

const STORAGE_AI_POEM = 'efengshui_ai_poem';

export interface SettingsState {
  /** When true, ask the server to generate AI lines for destiny spots (requires KIMI_API_KEY on server) */
  aiPoem: boolean;
  setAiPoem: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  /** 默认开启；仅在本地存过 `false` 时关闭（避免配好 Key 却仍只用内置辞库） */
  aiPoem: typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_AI_POEM) !== 'false',

  setAiPoem: (on) => {
    localStorage.setItem(STORAGE_AI_POEM, String(on));
    set({ aiPoem: on });
  },
}));
