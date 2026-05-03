import type { Element } from "./fengshui";

/** 城市周边预制景点 — 在线 POI 全失败时的兜底；亦用于 CityDiagnosis 等 UI */
export interface PresetCitySpot {
  name: string;
  lat: number;
  lng: number;
  el: Element;
  poem?: string;
}

export interface PresetCity {
  name: string;
  lat: number;
  lng: number;
  /** 距市中心多少 km 内视为「在该城」 */
  radius: number;
  el: Element;
  desc: string;
  spots: PresetCitySpot[];
}

export const PRESET_CITIES: PresetCity[] = [
  {
    name: "北京",
    lat: 39.9042,
    lng: 116.4074,
    radius: 80,
    el: "土",
    desc: "土金之气厚重，紫禁城中轴正南北，气场雄浑方正",
    spots: [
      {
        name: "景山公园万春亭",
        lat: 39.9244,
        lng: 116.3971,
        el: "土",
        poem:
          "向北望，全城在你脚下铺展。站在这里，土气最厚，适合理清头绪、做决定。",
      },
      {
        name: "什刹海银锭桥",
        lat: 39.9389,
        lng: 116.3833,
        el: "水",
        poem: "水边夕阳西下，橹声摇碎一湖金。喜水之人坐此，看水波不兴，心事自平。",
      },
      {
        name: "国家植物园北园",
        lat: 40.0028,
        lng: 116.2075,
        el: "木",
        poem:
          "向西北行，林木深处有幽径。木气生发之地，适合带着问题去，让答案在枝叶间自己落下。",
      },
      {
        name: "法源寺",
        lat: 39.8864,
        lng: 116.3714,
        el: "金",
        poem:
          "南城古寺，钟声清远。金气肃杀之地反而最适合放下执念，在香火稀薄处听见自己的声音。",
      },
      {
        name: "天坛公园祈年殿",
        lat: 39.8823,
        lng: 116.4066,
        el: "木",
        poem: "祭天之所，木德参天。环廊慢行，让心愿顺着柏树的影子往上长。",
      },
      {
        name: "颐和园昆明湖东堤",
        lat: 39.9997,
        lng: 116.2752,
        el: "水",
        poem: "湖风迎面，长堤如水袖。喜水者在此，宜放空思绪，让波纹替你排序。",
      },
      {
        name: "北海公园白塔",
        lat: 39.9259,
        lng: 116.3888,
        el: "土",
        poem: "琼岛春阴，塔影入湖。土气稳重，适合把纠结沉淀成一句清晰的话。",
      },
      {
        name: "国子监街孔庙",
        lat: 39.9474,
        lng: 116.4166,
        el: "金",
        poem: "碑林与古柏，金声玉振。宜静心读书式散步，把杂念留在朱门外。",
      },
      {
        name: "798艺术区",
        lat: 39.9844,
        lng: 116.4976,
        el: "火",
        poem: "旧厂房里的火旺创意。色彩与焊痕并存，适合点燃一件拖延已久的小事。",
      },
      {
        name: "奥林匹克森林公园南园",
        lat: 40.016,
        lng: 116.3915,
        el: "木",
        poem: "城市中轴北端的绿肺，跑道与林荫并行。木气流动，宜快走一圈理清头绪。",
      },
      {
        name: "首钢园秀池",
        lat: 39.9156,
        lng: 116.1608,
        el: "金",
        poem: "高炉与水面同框，工业骨骼里的静水。金水平衡，适合告别一段旧叙事。",
      },
      {
        name: "通州大运河森林公园",
        lat: 39.9026,
        lng: 116.7186,
        el: "水",
        poem: "运河水脉向东，两岸开阔。水气绵长，适合慢骑或久坐看船来船往。",
      },
    ],
  },
  {
    name: "上海",
    lat: 31.2304,
    lng: 121.4737,
    radius: 80,
    el: "水",
    desc: "东方水都，黄浦江龙脉蜿蜒，水气充盈流通",
    spots: [
      {
        name: "外滩源圆明园路",
        lat: 31.2436,
        lng: 121.4872,
        el: "金",
        poem:
          "万国建筑的石头缝里，金气沉了百年。清晨去，没人的时候，那些石头会跟你说话。",
      },
      {
        name: "徐汇滨江油罐艺术中心",
        lat: 31.1874,
        lng: 121.4626,
        el: "火",
        poem:
          "旧工业的火气未散，被改造成了艺术的形状。喜火之人来此，旧火新燃，创意自生。",
      },
      {
        name: "共青森林公园",
        lat: 31.3246,
        lng: 121.5551,
        el: "木",
        poem:
          "东北方向，杉林茂密如绿色隧道。木气最盛，适合迷路——有时候找不到方向才是找到方向的开始。",
      },
      {
        name: "苏州河昌平路桥",
        lat: 31.2431,
        lng: 121.4517,
        el: "水",
        poem: "跨在水上，看船来船往。水气流动之地，不聚财但聚人，适合约了重要的人散步。",
      },
    ],
  },
  {
    name: "纽约",
    lat: 40.7128,
    lng: -74.006,
    radius: 80,
    el: "金",
    desc: "世界金都，摩天如剑，金融脉动，金气最锐",
    spots: [
      {
        name: "High Line",
        lat: 40.748,
        lng: -74.0048,
        el: "木",
        poem:
          "废弃铁路改建的空中花园，木气从水泥缝里长出来。适合走完全程，让城市的噪音变成背景。",
      },
      {
        name: "Central Park Sheep Meadow",
        lat: 40.7717,
        lng: -73.9748,
        el: "土",
        poem:
          "曼哈顿中心的土，是全城最珍贵的一片踏实。躺下来，看摩天大楼围成的一小方块天。",
      },
      {
        name: "Brooklyn Bridge Walkway",
        lat: 40.7061,
        lng: -73.9969,
        el: "金",
        poem:
          "钢的琴弦，连接两个世界。走到桥中间，金气最锐，适合做一个决定——到了对岸就是新的开始。",
      },
      {
        name: "DUMBO Art District",
        lat: 40.7033,
        lng: -73.9881,
        el: "水",
        poem:
          "布鲁克林桥下的水岸，水气映着曼哈顿的天际线。适合黄昏去，让水把一天的紧张冲走。",
      },
      {
        name: "Washington Square Park",
        lat: 40.7308,
        lng: -73.9973,
        el: "火",
        poem: "拱门下的街头与学术交界，火气人情并存。适合观察人群，再决定自己的下一步。",
      },
      {
        name: "The Met Fifth Avenue",
        lat: 40.7794,
        lng: -73.9632,
        el: "金",
        poem: "博物馆的金气不喧哗。挑一件展品对视，像与另一个时空的自己打招呼。",
      },
      {
        name: "Bryant Park",
        lat: 40.7536,
        lng: -73.9832,
        el: "木",
        poem: "图书馆背后的绿洲，木气从草坪缝隙浮上来。适合午休十分钟，把日程忘掉一半。",
      },
      {
        name: "Prospect Park Long Meadow",
        lat: 40.6602,
        lng: -73.969,
        el: "土",
        poem: "布鲁克林的腹地草场，土气厚实。适合躺平望天，让心事沉进草根。",
      },
      {
        name: "Battery Park City Esplanade",
        lat: 40.7155,
        lng: -74.0165,
        el: "水",
        poem: "哈德逊水面开阔，风带着咸味。水气洗肺，适合日落散步，把焦虑交给潮汐。",
      },
      {
        name: "Gantry Plaza State Park",
        lat: 40.7447,
        lng: -73.9585,
        el: "水",
        poem: "长岛城对岸的天际线，水岸长椅一排。适合发呆看灯光掉进河里。",
      },
      {
        name: "Flushing Meadows Unisphere",
        lat: 40.7464,
        lng: -73.8447,
        el: "金",
        poem: "地球仪雕塑下的开阔广场，金气象征「世界」。适合把目标喊小声一点，反而更清楚。",
      },
      {
        name: "Green-Wood Cemetery Battle Hill",
        lat: 40.658,
        lng: -73.9976,
        el: "土",
        poem: "高地眺望港口的静谧角落，土气收纳。适合理清边界——何物值得停留，何物该随风。",
      },
    ],
  },
  {
    name: "洛杉矶",
    lat: 34.0522,
    lng: -118.2437,
    radius: 100,
    el: "火",
    desc: "阳光火都，终年晴朗，好莱坞火旺，创意燃烧",
    spots: [
      {
        name: "Griffith Observatory",
        lat: 34.1184,
        lng: -118.3004,
        el: "火",
        poem:
          "山顶上火气最旺，看日落把整座城市烧成金色。适合带一个人去，火主礼，共享沉默比说话重要。",
      },
      {
        name: "Venice Beach",
        lat: 33.985,
        lng: -118.4695,
        el: "水",
        poem:
          "太平洋的水气，冲浪者和滑板少年共享。脱了鞋走沙滩，让水气从脚底升上来。",
      },
      {
        name: "Huntington Library",
        lat: 34.1283,
        lng: -118.1141,
        el: "木",
        poem:
          "圣马力诺的绿洲，木气藏在日式庭院和中式园林里。适合在湖边坐一下午，木主仁，对自己仁慈。",
      },
      {
        name: "El Matador Beach",
        lat: 34.0383,
        lng: -118.8743,
        el: "土",
        poem:
          "Malibu的岩石海滩，土气在潮汐中若隐若现。日落时去，土克水，此刻稳如岩石。",
      },
    ],
  },
];
