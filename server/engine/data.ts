import type { Element, XiShen, Goal } from "@contracts/fengshui";

export const STEMS = [
  { n: '甲', el: '木' as Element, c: '#8bc34a', y: 0 }, { n: '乙', el: '木' as Element, c: '#8bc34a', y: 1 },
  { n: '丙', el: '火' as Element, c: '#ff8a65', y: 0 }, { n: '丁', el: '火' as Element, c: '#ff8a65', y: 1 },
  { n: '戊', el: '土' as Element, c: '#d4a574', y: 0 }, { n: '己', el: '土' as Element, c: '#d4a574', y: 1 },
  { n: '庚', el: '金' as Element, c: '#b0bec5', y: 0 }, { n: '辛', el: '金' as Element, c: '#b0bec5', y: 1 },
  { n: '壬', el: '水' as Element, c: '#4fc3f7', y: 0 }, { n: '癸', el: '水' as Element, c: '#4fc3f7', y: 1 },
];

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

export function stemToElement(stemName: string): Element {
  const s = STEMS.find(s => s.n === stemName);
  return s?.el ?? '木';
}

export function getStem(name: string) {
  return STEMS.find(s => s.n === name) ?? STEMS[0];
}
