/**
 * FFXIV PvP Map Rotation Calculator
 * 
 * This module handles the rotation logic for Frontline and Crystalline Conflict maps.
 * 
 * ## Maintenance Guide
 * 
 * ### Adding a new map:
 * 1. Add the map ID to FRONTLINE_MAPS or CC_MAPS array
 * 2. Add translations in src/lib/i18n.ts under maps and mapShort
 * 3. Add the map image in public/maps/ directory
 * 
 * ### Removing a map:
 * 1. Remove the map ID from the respective array
 * 2. Update the REFERENCE_DATE if needed (set to a known time when the new rotation starts)
 * 
 * ### Changing rotation order:
 * 1. Reorder the maps in the respective array
 * 2. Update the REFERENCE_DATE to a known point where the first map in the new order starts
 * 
 * ### Changing rotation interval:
 * 1. Update FRONTLINE_ROTATION_HOURS or CC_ROTATION_MINUTES
 * 2. Update the REFERENCE_DATE if the rotation timing changed
 */

export type FrontlineMap = 'secure' | 'seize' | 'shatter' | 'naadam' | 'triumph';
export type CCMap = 'palaistra' | 'volcanic' | 'castletown' | 'bayside' | 'cloudnine' | 'redsands' | 'harmonias';

// Frontline rotates every 24 hours at 23:00 Beijing time (15:00 UTC)
export const FRONTLINE_MAPS: FrontlineMap[] = [
  'seize', // 尘封秘岩
  'secure', // 周边遗迹群
  'naadam', // 昂萨哈凯尔
  'triumph', // 沃刻其特
  'seize', // 尘封秘岩
  'shatter', // 荣誉野
  'naadam', // 昂萨哈凯尔
  'triumph', // 沃刻其特
];
export const FRONTLINE_ROTATION_HOURS = 24;

// Reference: When first frontline starts
export const FRONTLINE_REFERENCE_DATE = new Date('2026-04-27T15:00:00Z');

// Crystalline Conflict rotates every 60 minutes
export const CC_MAPS: CCMap[] = [
  'palaistra', // 角力学校
  'volcanic', // 火山之心
  'bayside', // 海岸鸟群斗场
  'cloudnine', // 九霄云上
  'castletown', // 机关大殿
  'harmonias', // 休兵书库
  'redsands', // 赤土红沙
];
export const CC_ROTATION_MINUTES = 60;

// Reference: When first cc starts
export const CC_REFERENCE_DATE = new Date('2026-04-28T13:00:00Z');

/**
 * Calculate the current Frontline map and time until next rotation
 */
export function getCurrentFrontlineMap(now: Date = new Date()): {
  map: FrontlineMap;
  mapIndex: number;
  nextRotation: Date;
  timeRemaining: number;
} {
  const msPerHour = 60 * 60 * 1000;
  const rotationMs = FRONTLINE_ROTATION_HOURS * msPerHour;
  
  const timeDiff = now.getTime() - FRONTLINE_REFERENCE_DATE.getTime();
  const rotationIndex = Math.floor(timeDiff / rotationMs);
  
  // Handle negative index (before reference date)
  const mapCount = FRONTLINE_MAPS.length;
  const normalizedIndex = ((rotationIndex % mapCount) + mapCount) % mapCount;
  
  const currentRotationStart = new Date(FRONTLINE_REFERENCE_DATE.getTime() + rotationIndex * rotationMs);
  const nextRotation = new Date(currentRotationStart.getTime() + rotationMs);
  
  return {
    map: FRONTLINE_MAPS[normalizedIndex],
    mapIndex: normalizedIndex,
    nextRotation,
    timeRemaining: nextRotation.getTime() - now.getTime(),
  };
}

/**
 * Get the Frontline map for a specific date
 * Returns both the main snapshot map and day rotation breakdown
 */
export function getFrontlineMapForDate(
  date: Date,
  timezoneOffset: number = 8,
  activeTime: string = '12:00'
): {
  mainMap: FrontlineMap;
  snapshotMap: FrontlineMap;
  beforeSplitMap: FrontlineMap;
  afterSplitMap: FrontlineMap;
  lateNightMap: FrontlineMap;
} {
  // Create a date at 00:00 in the target timezone
  const tzOffsetMs = timezoneOffset * 60 * 60 * 1000;
  const utcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const targetMidnight = new Date(utcMidnight.getTime() - tzOffsetMs);

  // Parse active snapshot time (e.g. "12:00")
  let activeHour = 12;
  let activeMinute = 0;
  if (typeof activeTime === 'string') {
    const parts = activeTime.split(':').map(Number);
    if (!isNaN(parts[0])) activeHour = parts[0];
    if (!isNaN(parts[1])) activeMinute = parts[1];
  }
  const snapshotOffsetMs = (activeHour * 60 + activeMinute) * 60 * 1000;
  const snapshotTime = new Date(targetMidnight.getTime() + snapshotOffsetMs);
  const snapshotResult = getCurrentFrontlineMap(snapshotTime);

  // Split hour in local time when rotation occurs (15:00 UTC)
  const splitHour = ((15 + timezoneOffset) % 24 + 24) % 24;

  // Before split: pick a time before splitHour
  const beforeSplitOffsetHours = splitHour === 0 ? 1 : Math.max(0.1, splitHour / 2);
  const beforeSplitTime = new Date(targetMidnight.getTime() + beforeSplitOffsetHours * 60 * 60 * 1000);
  const beforeSplitResult = getCurrentFrontlineMap(beforeSplitTime);

  // After split: pick a time after splitHour
  const afterSplitOffsetHours = splitHour === 0 ? 1 : Math.min(23.9, (splitHour + 24) / 2);
  const afterSplitTime = new Date(targetMidnight.getTime() + afterSplitOffsetHours * 60 * 60 * 1000);
  const afterSplitResult = getCurrentFrontlineMap(afterSplitTime);

  return {
    mainMap: snapshotResult.map,
    snapshotMap: snapshotResult.map,
    beforeSplitMap: beforeSplitResult.map,
    afterSplitMap: afterSplitResult.map,
    lateNightMap: afterSplitResult.map,
  };
}

/**
 * Calculate the current Crystalline Conflict map and time until next rotation
 */
export function getCurrentCCMap(now: Date = new Date()): {
  map: CCMap;
  nextRotation: Date;
  timeRemaining: number;
} {
  const msPerMinute = 60 * 1000;
  const rotationMs = CC_ROTATION_MINUTES * msPerMinute;
  
  const timeDiff = now.getTime() - CC_REFERENCE_DATE.getTime();
  const rotationIndex = Math.floor(timeDiff / rotationMs);
  
  // Handle negative index (before reference date)
  const mapCount = CC_MAPS.length;
  const normalizedIndex = ((rotationIndex % mapCount) + mapCount) % mapCount;
  
  const currentRotationStart = new Date(CC_REFERENCE_DATE.getTime() + rotationIndex * rotationMs);
  const nextRotation = new Date(currentRotationStart.getTime() + rotationMs);
  
  return {
    map: CC_MAPS[normalizedIndex],
    nextRotation,
    timeRemaining: nextRotation.getTime() - now.getTime(),
  };
}

/**
 * Get CC maps for the next N hours
 */
export function getCCTimeline(hours: number = 30, now: Date = new Date()): Array<{
  map: CCMap;
  startTime: Date;
  endTime: Date;
}> {
  const timeline: Array<{ map: CCMap; startTime: Date; endTime: Date }> = [];
  const msPerMinute = 60 * 1000;
  const rotationMs = CC_ROTATION_MINUTES * msPerMinute;
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  let current = new Date(now);
  
  while (current.getTime() < endTime.getTime()) {
    const { map, nextRotation } = getCurrentCCMap(current);
    timeline.push({
      map,
      startTime: new Date(current),
      endTime: new Date(Math.min(nextRotation.getTime(), endTime.getTime())),
    });
    current = nextRotation;
  }
  
  return timeline;
}

/**
 * Format time remaining as HH:MM:SS
 */
export function formatTimeRemaining(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}
