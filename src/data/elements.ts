import type { Element, Stem, XiShen, Goal } from '@/types';

export const STEMS: Stem[] = [
  { n: '甲', el: '木', c: '#6b8f4a', y: 0 }, { n: '乙', el: '木', c: '#6b8f4a', y: 1 },
  { n: '丙', el: '火', c: '#ff8a65', y: 0 }, { n: '丁', el: '火', c: '#ff8a65', y: 1 },
  { n: '戊', el: '土', c: '#d4a574', y: 0 }, { n: '己', el: '土', c: '#d4a574', y: 1 },
  { n: '庚', el: '金', c: '#b0bec5', y: 0 }, { n: '辛', el: '金', c: '#b0bec5', y: 1 },
  { n: '壬', el: '水', c: '#4fc3f7', y: 0 }, { n: '癸', el: '水', c: '#4fc3f7', y: 1 },
];

/** 日干天干 → 五行（排盘路径必须与转盘路径一致，不能用天干字符串当 XI_SHEN 的键） */
export function stemGanToElement(gan: string): Element {
  const row = STEMS.find((s) => s.n === gan);
  return row?.el ?? '木';
}

export const GOALS: Record<Goal, string> = {
  creation: '创作灵感', study: '学习效率', sleep: '安睡',
  wealth: '财运', emotion: '情绪稳定', social: '人际关系',
};

export const DIRS: Record<string, number> = {
  北: 0, 东北: 45, 东: 90, 东南: 135,
  南: 180, 西南: 225, 西: 270, 西北: 315,
};

export const EL_DIR: Record<Element, string> = {
  木: '东', 火: '南', 土: '西南', 金: '西', 水: '北',
};

export const GOAL_DIR: Record<Goal, string> = {
  creation: '东', study: '北', sleep: '西南',
  wealth: '东南', emotion: '西', social: '南',
};

export const XI_SHEN: Record<Element, XiShen> = {
  木: { xi: ['水', '木'], ji: ['金', '土'], desc: '水生木，木喜水润滋养；忌金克伐、土耗泄' },
  火: { xi: ['木', '火'], ji: ['水', '金'], desc: '木生火，火喜木助燃烧；忌水熄灭、金耗散' },
  土: { xi: ['火', '土'], ji: ['木', '水'], desc: '火生土，土喜火温暖焙；忌木克陷、水冲刷' },
  金: { xi: ['土', '金'], ji: ['火', '木'], desc: '土生金，金喜土埋藏育；忌火熔炼、木耗损' },
  水: { xi: ['金', '水'], ji: ['土', '火'], desc: '金生水，水喜金发源流；忌土壅塞、火蒸发' },
};

export const WEATHER: Record<string, { name: string; desc: string; icon: string }> = {
  clear: { name: '晴', desc: '阳气充沛，光照明朗', icon: '☀️' },
  cloudy: { name: '多云', desc: '云气缭绕，阴阳调和', icon: '⛅' },
  rain: { name: '雨', desc: '水气盈天，润物无声', icon: '🌧️' },
  wind: { name: '风', desc: '风动气转，万物随摇', icon: '💨' },
  fog: { name: '雾', desc: '雾隐尘嚣，静观内省', icon: '🌫️' },
  snow: { name: '雪', desc: '寒气凝结，蓄势待发', icon: '❄️' },
  thunder: { name: '雷', desc: '雷动九天，革故鼎新', icon: '⚡' },
};

export const CITY_COMPAT: Record<Element, Record<Element, number>> = {
  木: { 木: 92, 水: 85, 火: 65, 土: 55, 金: 45 },
  火: { 火: 90, 木: 82, 土: 70, 金: 50, 水: 40 },
  土: { 土: 92, 火: 85, 金: 70, 水: 50, 木: 45 },
  金: { 金: 90, 土: 82, 水: 70, 木: 50, 火: 40 },
  水: { 水: 92, 金: 85, 木: 70, 土: 50, 火: 45 },
};

export { CITIES } from './cities';
export const WIKI_LANG_MAP: Record<string, string> = {
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en',
  JP: 'ja', KR: 'ko', SG: 'en',
  FR: 'fr', DE: 'de', ES: 'es', IT: 'it', RU: 'ru',
  BR: 'pt', IN: 'en', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es',
  ZA: 'en', NL: 'nl', BE: 'nl', CH: 'de', AT: 'de',
  SE: 'sv', NO: 'no', DK: 'da', FI: 'fi', PL: 'pl',
  CZ: 'cs', HU: 'hu', TR: 'tr', GR: 'el', PT: 'pt',
  TH: 'th', VN: 'vi', ID: 'id', MY: 'en', PH: 'en',
  AE: 'en', SA: 'ar', EG: 'ar', IL: 'he',
  UA: 'uk', RO: 'ro', BG: 'bg', HR: 'hr', RS: 'sr',
  SI: 'sl', SK: 'sk', LT: 'lt', LV: 'lv', EE: 'et',
};

export const DISTANCE_BUCKETS = {
  near: { label: '踱步', sub: '步行可达', icon: '🚶', max: 1200 },
  mid: { label: '半途', sub: '近郊漫步', icon: '🚲', min: 1200, max: 5500 },
  far: { label: '远行', sub: '遍历全城', icon: '🌆', min: 5500 },
};

export const GAODE_TYPES: Record<Element, string> = {
  木: '110100|110000|210000',
  水: '210000|110100',
  火: '110105|080000|050500',
  土: '140300|140600|140200',
  金: '050500|060600|140200',
};

export function getStem(name: string): Stem {
  return STEMS.find(s => s.n === name) ?? STEMS[0];
}
