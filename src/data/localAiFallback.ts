import { hash } from '@/utils/hash';
import type { Element } from '@/types';

/** 城市/地域文案截断，避免过长 */
export function cityShort(hint: string): string {
  const t = hint.trim();
  if (!t) return '此处天地';
  const first = t.split(/[,，·]/)[0]?.trim() ?? t;
  const s = first.slice(0, 10);
  return s || '此处天地';
}

const FUN_ADVICE_PRESETS: { icon: string; text: string }[] = [
  { icon: '🌿', text: '桌面上放一盆薄荷或绿萝，工作前摸三下叶子。这是你今天的微型森林，触叶即安。' },
  { icon: '🪟', text: '试试把座位挪到窗边，让自然光落在左手边。光是最好的闹钟，也是最温柔的监督员。' },
  { icon: '🫗', text: '左手边放一杯水，留三分之一不要喝完。让它慢慢蒸发，像一个小小的计时器提醒你休息。' },
  { icon: '🌅', text: '电脑壁纸换成有天空或树林的照片。每次切屏都像推开一扇窗，深呼吸一次再开始工作。' },
  { icon: '🕯️', text: '点一支普通蜡烛放在角落，让它自然烧完。火光跳动的时候，人的思绪也会跟着慢下来。' },
  { icon: '🪨', text: '口袋里放一块路边捡的小石头。今天遇事不决时握住它三秒，沉稳是传染的。' },
  { icon: '🧭', text: '椅子往吉方偏一点点，不用太正。风水讲究微偏则活，坐下时先深呼吸一次再开工。' },
  { icon: '🧦', text: '今天穿一双你最喜欢的袜子。舒服从脚开始，气场也是。' },
  { icon: '🍵', text: '喝一口水含在嘴里数七下再咽。不为什么，只是给自己一个暂停的理由。' },
  { icon: '🪑', text: '坐下之前用手掌贴一下桌面，掌心朝下停三秒。再忙，也别忘了你和这张桌子是一伙的。' },
  { icon: '🎐', text: '开窗换气三分钟，让旧念头跟着空气流走。不必立刻高效，先让身体知道外面还在运转。' },
  { icon: '🌙', text: '傍晚看一眼天色渐变，记下一句无关工作的话。日子需要一点「无用时刻」来托住你。' },
  { icon: '📎', text: '桌上只留一支笔、一张纸，杂物先塞抽屉。眼睛清爽，决策也会少一半噪音。' },
  { icon: '🐚', text: '随身带一件圆润小物（石子、贝壳皆可），心烦时用它描一圈掌心，把注意力拉回触觉。' },
  { icon: '🍊', text: '闻一闻柑橘或陈皮香，气味走最短路径进记忆，适合把自己从焦虑里拽回当下。' },
  { icon: '🪜', text: '上下楼梯时放慢半步，用脚掌先着地。今天的运势藏在「稳」里面，不藏在赶时间里面。' },
  { icon: '🧣', text: '肩颈怕冷就用围巾或衬衫简单挡一下风。身体边界清晰，别人的情绪也不容易灌进来。' },
  { icon: '🌧️', text: '若窗外阴雨，就把灯光调成偏暖。人造小晴天也是运势：你在给自己留余地。' },
  { icon: '☀️', text: '若窗外明亮，戴帽子或拉百叶留一条光带。强光时代也需要阴影来歇脚。' },
  { icon: '🎵', text: '换一首没听过的纯音乐当背景，音量低到刚好盖住杂念。新旋律是在给大脑换跑道。' },
  { icon: '📷', text: '拍一张桌面或窗外的照片存档，但不发朋友圈。记录是为了提醒自己：此刻还活着。' },
  { icon: '🍜', text: '正餐吃一口热的，哪怕只是一碗面。胃暖了，脑子才不会跟着拧巴。' },
  { icon: '🚶', text: '接电话前先站起来走两步。脚底离地一寸，语气都会软一点。' },
  { icon: '🪴', text: '给植物擦叶子或换水，水质清澈就像把你的思绪也滤了一遍。' },
  { icon: '🧵', text: '整理一根耳机线或鞋带，打一个小巧的结。琐事收拾干净，大事更容易进门。' },
  { icon: '🕊️', text: '今天少说两句结论，多问一句「你怎么看」。柔软的发问比强硬的主张更招人缘。' },
  { icon: '🔔', text: '设一个轻柔铃声作为番茄钟结束音，别用刺耳闹钟。结束也该体面，像风铃，不像警报。' },
  { icon: '🌲', text: '找一棵树或一根柱子，背靠站十秒，想象多余的重量卸给它。借力不是偷懒，是顺势。' },
  { icon: '💧', text: '洗脸后用冷水拍两下颧骨，像把雾气拍散。面部清爽，说话也会有棱角。' },
  { icon: '📖', text: '读三段无关功利的文字，小说杂文都行。给理性放假半小时，灵感才有缝钻进来。' },
  { icon: '🧊', text: '手腕内侧贴一下金属或玻璃降温，像给自己盖一枚隐形印章：此刻冷静可用。' },
  { icon: '🎋', text: '在常用物品边贴一张小便签，只写一个字提醒呼吸。字越少，越不容易变成压力。' },
  { icon: '🌊', text: '想象气息从丹田走到脚尖再走回来，走三个来回。不必懂经络，懂「慢」就够。' },
  { icon: '🦢', text: '走路时刻意把肩膀下沉半寸，下巴微收。身形舒展，别人看你的眼神也会柔一点。' },
];

function pickThreeDistinct<T>(pool: T[], h: number): T[] {
  if (pool.length === 0) return [];
  const n = pool.length;
  const out: T[] = [];
  const used = new Set<number>();
  let salt = 0;
  while (out.length < 3 && salt < n * 6) {
    const idx = ((h + salt * 2654435761) >>> 0) % n;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    }
    salt++;
  }
  while (out.length < 3 && out.length < n) {
    const idx = out.length % n;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    } else break;
  }
  return out.slice(0, 3);
}

/** 离线锦囊：按日期、坐标、八字字段确定性抽取，并混入地域/意图相关句 */
export function pickLocalFunAdvices(params: {
  el: Element;
  xi: string[];
  goalLabel: string;
  goalKey: string;
  cityHint: string;
  stem: string;
  lat: number;
  lng: number;
  weatherLabel: string;
}): { icon: string; text: string }[] {
  const dayKey = new Date().toISOString().slice(0, 10);
  const seed = `${dayKey}|${params.lat.toFixed(3)}|${params.lng.toFixed(3)}|${params.goalKey}|${params.el}|${params.stem}|${params.xi.join(',')}|${params.cityHint}|${params.goalLabel}|${params.weatherLabel}`;
  const h = hash(seed);
  const cx = cityShort(params.cityHint);
  const xiFirst = params.xi[0] || '木';

  const contextual: { icon: string; text: string }[] = [
    { icon: '📍', text: `今日在「${cx}」一带活动时，尽量走一条没走过的街口再回头，新路换心境。` },
    { icon: '🗺️', text: `把「${cx}」当成一张情绪地图：烦躁往南边走两步透气，想静就往树荫与水边靠。` },
    {
      icon: '🎯',
      text: `你现在锚点在「${cx}」，先把今日目标缩成一句可说出口的话，写在手机备忘录置顶。`,
    },
    {
      icon: '✨',
      text: `喜${xiFirst}气环绕时，适合在「${cx}」附近找一处高处远眺五分钟，再回来做事。`,
    },
    { icon: '🌤️', text: `天气写照是「${params.weatherLabel}」，不必对抗天象，顺着它安排室内外节奏就好。` },
    { icon: '🎋', text: `为「${params.goalLabel}」留一小段不受打扰的时段，比通宵硬扛更接近开运。` },
    { icon: '🔢', text: `日主天干「${params.stem}」今日宜以柔克刚：先处理人际与沟通，再啃硬任务。` },
  ];

  const pool = [...FUN_ADVICE_PRESETS, ...contextual];
  return pickThreeDistinct(pool, h);
}

const ITEM_POOL: { icon: string; name: string; desc: string }[] = [
  { icon: '🪵', name: '木质物件', desc: '一块木头的手感，是任何塑料都给不了的踏实。' },
  { icon: '🔴', name: '红色小物', desc: '不用大面积，一点点就够了——是给自己的一个小标记。' },
  { icon: '🏺', name: '陶瓷物件', desc: '泥土烧出来的东西，自带安定的气质。' },
  { icon: '🔑', name: '金属钥匙扣', desc: '金属的声音和重量，是日常生活中最容易忽略的质感。' },
  { icon: '🧊', name: '透明玻璃物', desc: '玻璃的通透提醒你：有时候看得清，不如看得淡。' },
  { icon: '📿', name: '手串或项链', desc: '贴身之物在替你说话，选一个今天想戴在身上的。' },
  { icon: '🪶', name: '羽毛或绒毛', desc: '轻的东西最讲究平衡，带一根羽毛在身边，提醒自己放松。' },
  { icon: '📖', name: '一本纸质书', desc: '不用读完，带在身边就行。书的气场会潜移默化地影响你。' },
  { icon: '🌿', name: '干花或香叶', desc: '植物的残余香气，是自然界最小的安慰剂。' },
  { icon: '💎', name: '水晶或矿石', desc: '不用管功效，选一个你今天看着顺眼的。喜欢就是最好的能量。' },
  { icon: '🧣', name: '围巾或方巾', desc: '护住颈肩就像护住一口气，柔软边界让人更敢开口。' },
  { icon: '🎧', name: '降噪耳机', desc: '听见更少杂音，才能听见自己真正的节奏。' },
  { icon: '🖋️', name: '钢笔或签字笔', desc: '落笔有痕，今天的承诺写给自己也算数。' },
  { icon: '🍵', name: '保温杯', desc: '一口热水下去，肠胃安稳，决策就不容易飘。' },
  { icon: '👟', name: '舒适鞋垫', desc: '脚底稳了，说话走路都有根。' },
  { icon: '🌙', name: '眼罩或丝巾', desc: '遮住多余光线，也遮住对他人的过度揣测。' },
  { icon: '🐚', name: '贝壳或螺钿', desc: '螺旋纹路提醒你：事情可以一圈一圈慢慢绕出来。' },
  { icon: '🕯️', name: '香薰蜡烛', desc: '一丁点火光就够，情绪不需要燎原才显得认真。' },
  { icon: '🧴', name: '护手霜', desc: '手柔软了，敲键盘都像在抚摸今天的机会。' },
  { icon: '🎐', name: '流苏挂饰', desc: '风吹微动，提醒你外界在变，你不必钉死在原地。' },
];

const TIME_SLOTS = [
  '07:00-09:00',
  '09:00-11:00',
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
  '19:00-21:00',
];

/** 明日预言离线文案：意象化，不写具体气象数值 */
const PROPHECY_ADVICE_LINES: string[] = [
  '明日气场像一层薄雾，看得见路却不必看清远处。先照顾脚下三步，再谈远方。',
  '明天适合把「未完成」拆成小块：完成一小块，就像在心里点亮一盏小灯。',
  '明日若有阴晴变化，把它当成布景切换，你仍是镜头里的主角，换场景不换定力。',
  '明天的人际像微风贴面：不必说服所有人，先让对话柔软落地。',
  '明日灵感可能来自意外岔路：允许自己绕一点远路，反而捡到素材。',
  '明天财运更像整理抽屉：先清点，再决定扔留，冲动消费容易盖住机会。',
  '明日身体提醒你补水与停顿：走得慢不是懈怠，是在给运气留门缝。',
  '明天适合把情绪写下来再删除重写，像剪辑一样对待心事。',
  '明日若感到阻滞，换一扇窗、换一条路回家，动线一变，念头也会跟着拐弯。',
  '明天的好运常躲在「帮别人一个小忙」里面，举手之劳别吝啬。',
  '明日适合复盘而非硬冲：把上周遗留的一件小事收尾，心里会轻一半。',
  '明天说话宜短、宜慢，像茶汤晾一晾再喝，烫嘴的话往往也烫运气。',
  '明日若有纷争迹象，先离场三分钟：风暴需要一个不接力的人才会熄。',
  '明天适合把梦想说成预算：时间、精力、情绪各划一格，梦才落地。',
  '明日气场偏静，适合读书、散步、整理；喧哗场合记得戴耳机护住心神。',
  '明天你可能更容易被细节打动：记下一句好听的话，它会发酵成运气。',
  '明日若有远行或奔波，行李越简越好，累赘拖慢的不只是身体。',
  '明天适合「先道歉再解释」，姿态低了，路反而宽。',
  '明日桃花与人缘藏在倾听里：复述对方最后一句话，关系会神奇升温。',
  '明天试着把抱怨换成一句具体请求，宇宙只能回应清晰订单。',
  '明日若有突发，当作即兴演出：台词忘了就微笑停顿，观众会原谅真实。',
  '明天财运忌借贷冲动；若有诱惑，先睡一觉再决定。',
  '明日健康提示：肩颈与眼睛需要轮流休息，屏幕亮心里也要暗一点。',
  '明天适合清理聊天列表里三位不再互动的人，心灵带宽很贵。',
  '明日若有旧人联系，先分辨是怀旧还是需要；界线清晰是对彼此温柔。',
  '明天把「谢谢」说具体：谢什么、带来什么感受，感恩才会扎根。',
  '明日气场适合写作与记录：灵感像露水，太阳一出就散，先接住。',
  '明天走路抬头看建筑轮廓，低头看手机的时间砍半，运势跟着抬头。',
  '明日若有犹豫，抛硬币不是听正反，而是看抛起那一刻你心里偏向哪边。',
  '明天适合把大目标换成「今天只赢一小局」，连胜来自小胜累计。',
  '明日情绪若起伏，去闻咖啡、茶或面包香气，嗅觉会把理性带回鼻腔之上。',
  '明天试试提前十分钟到约定地点，从容是最好的开运妆容。',
  '明日若有雨意，带折叠伞像带底线：不逞强淋雨，也不恐惧潮湿。',
  '明天适合整理钱包与账单，财运喜欢清爽容器。',
  '明日若有聚会，少喝一杯酒多笑三次，人缘比酒精持久。',
  '明天把手机的「勿扰」打开一小时，深度工作是最好的招财仪式。',
  '明日气场提醒你：善良要带锋芒，帮忙前先问自己累不累。',
  '明天试着称赞一位后辈或新人，上行下效，好运会循环回来。',
  '明日若有梦境碎片，记下来再解读；潜意识在给明天的剧情埋伏笔。',
  '明天适合换一条路通勤，风景换了，惯性才会松。',
  '明日若感孤独，养一盆小植物或喂一只流浪动物，连接感会回流。',
  '明天把抱怨写成段子讲给朋友听，笑出来就比憋着体面。',
  '明日气场偏柔，适合谈判与和解；硬碰硬记得留给后天。',
  '明天试着把手机壁纸换成让你安心的画面，每一次解锁都是暗示。',
  '明日若有喜讯，先与家人分享再发朋友圈，福气要先在内圈扎根。',
  '明天走路故意放慢呼吸三下再走下一步，焦虑会掉队。',
  '明日适合整理桌面左上角——贵人位清爽，协助你的人更容易出现。',
];

function prophecyAdviceForXi(xi: string[], h: number, place: string, stem: string, goalKey: string): string {
  const base = PROPHECY_ADVICE_LINES[h % PROPHECY_ADVICE_LINES.length];
  const mood =
    goalKey === 'wealth'
      ? '明日财物往来宜慢不宜快，先核对再出手。'
      : goalKey === 'emotion'
        ? '明日先把呼吸理顺，情绪会像退潮一样给你腾出空地。'
        : goalKey === 'social'
          ? '明日人缘来自真诚倾听，少打断一次，多一个朋友位。'
          : goalKey === 'study'
            ? '明日学习宜番茄分段，记忆像种地，翻土比撒种急不得。'
            : goalKey === 'sleep'
              ? '明日午后少咖啡因，夜晚泡脚三分钟，梦会替你整理白天。'
              : goalKey === 'creation'
                ? '明日灵感像雾：别等晴，带本子出门写下一句就成。'
                : '';

  const xiLine = xi.includes('水')
    ? '水气明日偏柔：靠近水边或浴室多呆两分钟，心情会顺流而下。'
    : xi.includes('火')
      ? '火气明日宜疏不宜堵：晒太阳或走动出汗，比憋着更像开运。'
      : xi.includes('木')
        ? '木气明日宜舒展：伸展四肢，像树梢伸向天空那样拉开胸腔。'
        : xi.includes('金')
          ? '金气明日宜断舍离：剪掉一根分叉的发梢也算，利落带来清爽。'
          : xi.includes('土')
            ? '土气明日宜扎根：脚部保暖与饮食定时，身体稳了运势才托得住。'
            : '';

  const placeLine =
    place !== '此处天地'
      ? `你在「${place}」一带，明日少走回头路，岔口先观察再迈步。`
      : '';

  const stemLine = stem ? `日主${stem}明日宜以守为攻：先守住节奏，机会常在第二轮敲门。` : '';

  const extras = [mood, xiLine, placeLine, stemLine].filter(Boolean);
  const suffix = extras.length ? extras[h % extras.length] : '';
  return suffix ? `${base} ${suffix}` : base;
}

/** 离线明日预言块 */
export function pickLocalProphecy(params: {
  xi: string[];
  lat: number;
  lng: number;
  stem: string;
  floor: number;
  goalKey: string;
  cityHint: string;
  forecastDetail: string;
}): {
  advice: string;
  dir: string;
  time: string;
  itemIcon: string;
  itemName: string;
  itemDesc: string;
} {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fd = params.forecastDetail.trim();
  const seed = `${params.lat.toFixed(4)},${params.lng.toFixed(4)},${tomorrow.getMonth() + 1},${tomorrow.getDate()},${params.stem},${params.floor},${params.goalKey},${params.cityHint},${fd.slice(0, 48)},${params.xi.join(',')}`;
  const h = hash(seed);
  const dirs = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];
  const dir = dirs[h % 8];
  const time = TIME_SLOTS[(h >> 2) % TIME_SLOTS.length];
  const item = ITEM_POOL[(h + 123) % ITEM_POOL.length];
  const place = cityShort(params.cityHint);
  const advice = prophecyAdviceForXi(params.xi, h, place, params.stem, params.goalKey);

  return {
    advice,
    dir,
    time,
    itemIcon: item.icon,
    itemName: item.name,
    itemDesc: item.desc,
  };
}
