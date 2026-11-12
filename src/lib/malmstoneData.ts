// 星里路标（Series Malmstones）等级经验与玩法次数计算逻辑

export const TARGET_MALMSTONE_LEVEL = 25;

// 当前赛季结束日期（由开发者手动维护配置，格式 YYYY-MM-DD）
export const SERIES_END_DATE = '2027-02-19';

/**
 * 计算当前日期距离赛季结束日期的剩余天数
 */
export function getRemainingDaysInSeries(now: Date = new Date()): number {
  const [year, month, day] = SERIES_END_DATE.split('-').map(Number);
  const endDate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = endDate.getTime() - today.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * 获取从指定等级升至下一级所需的经验值
 */
export function getExpForNextLevel(level: number): number {
  if (level >= 1 && level <= 4) return 2000;
  if (level >= 5 && level <= 9) return 3000;
  if (level >= 10 && level <= 14) return 4000;
  if (level >= 15 && level <= 19) return 5500;
  if (level >= 20 && level <= 24) return 7500;
  if (level >= 25 && level <= 29) return 10000;
  return 20000;
}

/**
 * 获取从1级0经验累计到目标等级0经验所需的总经验值
 */
export function getCumulativeExpToLevel(targetLevel: number): number {
  let total = 0;
  for (let lvl = 1; lvl < targetLevel; lvl++) {
    total += getExpForNextLevel(lvl);
  }
  return total;
}

// 1级到25级总计所需经验（108,000）
export const TOTAL_EXP_TO_TARGET = getCumulativeExpToLevel(TARGET_MALMSTONE_LEVEL);

/**
 * 计算玩家当前已累计的总经验值与距离目标等级（25级）的差额经验
 */
export function calculateMalmstoneProgress(currentLevel: number, currentExp: number) {
  const clampedLevel = Math.min(TARGET_MALMSTONE_LEVEL, Math.max(1, Math.floor(currentLevel || 1)));
  const maxExpInLevel = clampedLevel >= TARGET_MALMSTONE_LEVEL ? 0 : getExpForNextLevel(clampedLevel);
  const clampedExp =
    clampedLevel >= TARGET_MALMSTONE_LEVEL
      ? 0
      : Math.min(maxExpInLevel, Math.max(0, Math.floor(currentExp || 0)));

  const earnedExp = getCumulativeExpToLevel(clampedLevel) + clampedExp;
  const remainingExp = Math.max(0, TOTAL_EXP_TO_TARGET - earnedExp);
  const progressPercent = Math.min(100, Math.max(0, (earnedExp / TOTAL_EXP_TO_TARGET) * 100));

  return {
    clampedLevel,
    clampedExp,
    maxExpInLevel,
    earnedExp,
    remainingExp,
    totalExp: TOTAL_EXP_TO_TARGET,
    progressPercent,
  };
}

/**
 * 纷争前线单场稳态期望基础经验：
 * 计数器 c ∈ {0,1,2,3,4,5}，冠/亚/季各 1/3 概率下：
 * 冠军重置 c=0，亚军保持 c 不变，季军 c=min(5, c+1)
 * 稳态分布 π = (1/2, 1/4, 1/8, 1/16, 1/32, 1/32)，期望计数 E[c] = 31/32 = 0.96875
 * 单场基础均值 = 1250 × (1 + 0.1 × 31/32) = 1371.09375
 */
export const FRONTLINE_EXPECTED_BASE_EXP = 1250 * (1 + 0.1 * (31 / 32));
export const DAILY_FRONTLINE_BONUS_EXP = 1500;

export interface FrontlineCalcResult {
  minMatches: number; // 最优情况所需场次
  maxMatches: number; // 最差情况所需场次
  expectedMatches: number; // 平均期望所需场次
  expectedExpPerMatch: number; // 单场期望经验
}

/**
 * 使用动态规划计算纷争前线（含季军加成状态机）达成目标差额经验的最优/最差/期望场次
 * 状态 c ∈ {0..5} 表示当前季军加成计数（每层+10%基础奖励，最高+50%）
 * 结算当前局奖励后：冠军 c->0，亚军 c->c，季军 c->min(5, c+1)
 */
export function calculateFrontlineMatches(
  remainingExp: number,
  dailyBonus: number = 0
): FrontlineCalcResult {
  const expectedExpPerMatch = FRONTLINE_EXPECTED_BASE_EXP + dailyBonus;

  if (remainingExp <= 0) {
    return {
      minMatches: 0,
      maxMatches: 0,
      expectedMatches: 0,
      expectedExpPerMatch,
    };
  }

  // maxExp[c]: 完成 n 场后处于状态 c 时的最大累计经验
  let maxExp = [0, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];
  // minExp[c]: 完成 n 场后处于状态 c 时的最小累计经验
  let minExp = [0, Infinity, Infinity, Infinity, Infinity, Infinity];

  let minMatches = 0;
  let maxMatches = 0;
  let n = 0;

  // 逐步推进场次直至最差情况也达成目标经验
  while (minMatches === 0 || maxMatches === 0) {
    n++;
    const nextMax = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];
    const nextMin = [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity];

    for (let c = 0; c <= 5; c++) {
      const multiplier = 1 + 0.1 * c;
      const exp1st = Math.round(1500 * multiplier) + dailyBonus;
      const exp2nd = Math.round(1250 * multiplier) + dailyBonus;
      const exp3rd = Math.round(1000 * multiplier) + dailyBonus;
      const nextC3rd = Math.min(5, c + 1);

      if (maxExp[c] > -Infinity) {
        // 冠军 -> 重置计数为 0
        nextMax[0] = Math.max(nextMax[0], maxExp[c] + exp1st);
        // 亚军 -> 计数不变
        nextMax[c] = Math.max(nextMax[c], maxExp[c] + exp2nd);
        // 季军 -> 计数 +1（最高 5）
        nextMax[nextC3rd] = Math.max(nextMax[nextC3rd], maxExp[c] + exp3rd);
      }

      if (minExp[c] < Infinity) {
        // 冠军 -> 重置计数为 0
        nextMin[0] = Math.min(nextMin[0], minExp[c] + exp1st);
        // 亚军 -> 计数不变
        nextMin[c] = Math.min(nextMin[c], minExp[c] + exp2nd);
        // 季军 -> 计数 +1（最高 5）
        nextMin[nextC3rd] = Math.min(nextMin[nextC3rd], minExp[c] + exp3rd);
      }
    }

    maxExp = nextMax;
    minExp = nextMin;

    if (minMatches === 0 && Math.max(...maxExp) >= remainingExp) {
      minMatches = n;
    }
    if (maxMatches === 0 && Math.min(...minExp) >= remainingExp) {
      maxMatches = n;
    }
  }

  const expectedMatches = Math.ceil(remainingExp / expectedExpPerMatch);

  return {
    minMatches,
    maxMatches,
    expectedMatches,
    expectedExpPerMatch,
  };
}

/**
 * 计算固定胜负区间玩法（水晶冲突、烈羽争锋）所需场次
 */
export function calculateSimpleModeMatches(
  remainingExp: number,
  lossExp: number,
  winExp: number
) {
  if (remainingExp <= 0) {
    return { minMatches: 0, maxMatches: 0 };
  }
  return {
    minMatches: Math.ceil(remainingExp / winExp),
    maxMatches: Math.ceil(remainingExp / lossExp),
  };
}
