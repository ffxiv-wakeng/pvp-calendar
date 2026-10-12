/**
 * 最终幻想14 纷争前线 职业补正及属性数据
 * 
 * 维护说明：
 * - 游戏版本更新调整职业数值时，直接修改对应职业的属性即可。
 * - id: 对应 public/jobs/{id}.png
 * - role: 职能类别 ('tank' | 'melee' | 'ranged' | 'caster' | 'healer')
 * - hp: 基础生命值
 * - damageDealt: 给予伤害补正（小数，-0.10 代表 -10%，0 代表无补正）
 * - damageTaken: 受到伤害补正（小数，-0.45 代表 -45%，即减伤45%）
 * - lbGauge: 极限槽积蓄时间调整（秒数，+15 代表 +15秒，-15 代表 -15秒，0 代表无调整）
 */

export type JobRole = 'tank' | 'healer' | 'melee' | 'ranged' | 'caster';

export interface JobData {
  id: string;
  name: {
    zh: string;
    ja: string;
    en: string;
  };
  role: JobRole;
  hp: number;
  damageDealt: number;
  damageTaken: number;
  lbGauge: number;
}

export const JOB_DATA: JobData[] = [
  // 防护职业 (Tank)
  {
    id: 'paladin',
    name: { zh: '骑士', ja: 'ナイト', en: 'Paladin' },
    role: 'tank',
    hp: 64500,
    damageDealt: 0,
    damageTaken: -0.45,
    lbGauge: 15,
  },
  {
    id: 'warrior',
    name: { zh: '战士', ja: '戦士', en: 'Warrior' },
    role: 'tank',
    hp: 66000,
    damageDealt: -0.10,
    damageTaken: -0.50,
    lbGauge: 0,
  },
  {
    id: 'darkknight',
    name: { zh: '暗黑骑士', ja: '暗黒騎士', en: 'Dark Knight' },
    role: 'tank',
    hp: 64500,
    damageDealt: -0.15,
    damageTaken: -0.40,
    lbGauge: 45,
  },
  {
    id: 'gunbreaker',
    name: { zh: '绝枪战士', ja: 'ガンブレイカー', en: 'Gunbreaker' },
    role: 'tank',
    hp: 63000,
    damageDealt: 0,
    damageTaken: -0.55,
    lbGauge: 15,
  },

  // 治疗职业 (Healer)
  {
    id: 'whitemage',
    name: { zh: '白魔法师', ja: '白魔道士', en: 'White Mage' },
    role: 'healer',
    hp: 55500,
    damageDealt: -0.10,
    damageTaken: -0.25,
    lbGauge: 15,
  },
  {
    id: 'scholar',
    name: { zh: '学者', ja: '学者', en: 'Scholar' },
    role: 'healer',
    hp: 54000,
    damageDealt: -0.10,
    damageTaken: -0.30,
    lbGauge: 0,
  },
  {
    id: 'astrologian',
    name: { zh: '占星术士', ja: '占星術師', en: 'Astrologian' },
    role: 'healer',
    hp: 52500,
    damageDealt: -0.15,
    damageTaken: -0.25,
    lbGauge: 15,
  },
  {
    id: 'sage',
    name: { zh: '贤者', ja: '賢者', en: 'Sage' },
    role: 'healer',
    hp: 54000,
    damageDealt: 0,
    damageTaken: -0.35,
    lbGauge: 0,
  },

  // 近战DPS (Melee DPS)
  {
    id: 'monk',
    name: { zh: '武僧', ja: 'モンク', en: 'Monk' },
    role: 'melee',
    hp: 63000,
    damageDealt: 0,
    damageTaken: -0.55,
    lbGauge: 0,
  },
  {
    id: 'dragoon',
    name: { zh: '龙骑士', ja: '竜騎士', en: 'Dragoon' },
    role: 'melee',
    hp: 61500,
    damageDealt: -0.10,
    damageTaken: -0.50,
    lbGauge: 15,
  },
  {
    id: 'ninja',
    name: { zh: '忍者', ja: '忍者', en: 'Ninja' },
    role: 'melee',
    hp: 60000,
    damageDealt: 0,
    damageTaken: -0.45,
    lbGauge: 15,
  },
  {
    id: 'samurai',
    name: { zh: '武士', ja: '侍', en: 'Samurai' },
    role: 'melee',
    hp: 61500,
    damageDealt: -0.05,
    damageTaken: -0.55,
    lbGauge: 15,
  },
  {
    id: 'reaper',
    name: { zh: '钐镰客', ja: 'リーパー', en: 'Reaper' },
    role: 'melee',
    hp: 61500,
    damageDealt: 0,
    damageTaken: -0.50,
    lbGauge: 15,
  },
  {
    id: 'viper',
    name: { zh: '蝰蛇剑士', ja: 'ヴァイパー', en: 'Viper' },
    role: 'melee',
    hp: 61500,
    damageDealt: -0.05,
    damageTaken: -0.55,
    lbGauge: 0,
  },

  // 远敏DPS (Physical Ranged DPS)
  {
    id: 'bard',
    name: { zh: '吟游诗人', ja: '吟遊詩人', en: 'Bard' },
    role: 'ranged',
    hp: 55500,
    damageDealt: 0,
    damageTaken: -0.30,
    lbGauge: -15,
  },
  {
    id: 'machinist',
    name: { zh: '机工士', ja: '機工士', en: 'Machinist' },
    role: 'ranged',
    hp: 58500,
    damageDealt: 0,
    damageTaken: -0.30,
    lbGauge: 0,
  },
  {
    id: 'dancer',
    name: { zh: '舞者', ja: '踊り子', en: 'Dancer' },
    role: 'ranged',
    hp: 58500,
    damageDealt: 0,
    damageTaken: -0.35,
    lbGauge: 30,
  },

  // 法系DPS (Magical Ranged DPS)
  {
    id: 'blackmage',
    name: { zh: '黑魔法师', ja: '黒魔道士', en: 'Black Mage' },
    role: 'caster',
    hp: 52500,
    damageDealt: -0.05,
    damageTaken: -0.30,
    lbGauge: 0,
  },
  {
    id: 'summoner',
    name: { zh: '召唤师', ja: '召喚士', en: 'Summoner' },
    role: 'caster',
    hp: 57000,
    damageDealt: -0.10,
    damageTaken: -0.30,
    lbGauge: 15,
  },
  {
    id: 'redmage',
    name: { zh: '赤魔法师', ja: '赤魔道士', en: 'Red Mage' },
    role: 'caster',
    hp: 58500,
    damageDealt: 0,
    damageTaken: -0.45,
    lbGauge: 0,
  },
  {
    id: 'pictomancer',
    name: { zh: '绘灵法师', ja: 'ピクトマンサー', en: 'Pictomancer' },
    role: 'caster',
    hp: 54000,
    damageDealt: -0.10,
    damageTaken: -0.30,
    lbGauge: 0,
  },
];

/**
 * 计算等效血量：HP / (1 + 受到伤害补正)
 * 例如受到伤害补正为 -0.55 时，等效血量 = HP / (1 - 0.55)
 */
export function calculateEffectiveHp(hp: number, damageTaken: number): number {
  const divider = 1 + damageTaken;
  if (divider <= 0) return hp;
  return Math.round(hp / divider);
}

/**
 * 连招伤害计算逻辑：
 * 最终伤害 = 连招威力 × (1 + 造成伤害补正) × (1 + 斗志昂扬增伤) × (处于坚守阵地 ? 1.5 : 1) × (1 + 目标受到伤害补正)
 * 各种增伤、减伤均为乘算。
 */
export function calculateComboDamage(
  potency: number,
  attackerDealtAdjustment: number,
  battleHighLevel: number,
  isGuarding: boolean,
  targetTakenAdjustment: number
): number {
  const dealtMultiplier = 1 + attackerDealtAdjustment;
  const battleHighMultiplier = 1 + battleHighLevel * 0.1;
  const guardMultiplier = isGuarding ? 1.5 : 1.0;
  const takenMultiplier = 1 + targetTakenAdjustment;

  return potency * dealtMultiplier * battleHighMultiplier * guardMultiplier * takenMultiplier;
}

/**
 * 计算斩杀线（对目标生命值造成的百分比伤害）
 */
export function calculateKillThreshold(damage: number, targetHp: number): number {
  if (targetHp <= 0) return 0;
  return (damage / targetHp) * 100;
}
