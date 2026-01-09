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

export type FrontlineMap = 'secure' | 'seize' | 'shatter' | 'naadam';
export type CCMap = 'palaistra' | 'volcanic' | 'castletown' | 'bayside' | 'cloudnine' | 'redsands';

// Frontline rotates every 24 hours at 23:00 Beijing time (15:00 UTC)
export const FRONTLINE_MAPS: FrontlineMap[] = ['secure', 'seize', 'shatter', 'naadam'];
export const FRONTLINE_ROTATION_HOURS = 24;

// Reference: 2025-07-16T15:00:00Z is when 'secure' starts
export const FRONTLINE_REFERENCE_DATE = new Date('2025-07-16T15:00:00Z');

// Crystalline Conflict rotates every 90 minutes
export const CC_MAPS: CCMap[] = ['palaistra', 'volcanic', 'castletown', 'bayside', 'cloudnine', 'redsands'];
export const CC_ROTATION_MINUTES = 90;

// Reference: 2026-01-09T15:00:00Z is when 'palaistra' starts
export const CC_REFERENCE_DATE = new Date('2026-01-09T15:00:00Z');

/**
 * Calculate the current Frontline map and time until next rotation
 */
export function getCurrentFrontlineMap(now: Date = new Date()): {
  map: FrontlineMap;
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
    nextRotation,
    timeRemaining: nextRotation.getTime() - now.getTime(),
  };
}

/**
 * Get the Frontline map for a specific date
 * Returns both the main map (00:00-22:59) and late night map (23:00-23:59)
 */
export function getFrontlineMapForDate(date: Date, timezoneOffset: number = 8): {
  mainMap: FrontlineMap;
  lateNightMap: FrontlineMap;
} {
  // Create a date at 00:00 in the target timezone
  const tzOffsetMs = timezoneOffset * 60 * 60 * 1000;
  const utcMidnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const targetMidnight = new Date(utcMidnight.getTime() - tzOffsetMs);
  
  // Main map: active from 00:00 to 22:59
  const mainMapTime = new Date(targetMidnight.getTime() + 1 * 60 * 60 * 1000); // 01:00 to be safe
  const mainMapResult = getCurrentFrontlineMap(mainMapTime);
  
  // Late night map: active from 23:00 to 23:59
  const lateNightTime = new Date(targetMidnight.getTime() + 23 * 60 * 60 * 1000);
  const lateNightResult = getCurrentFrontlineMap(lateNightTime);
  
  return {
    mainMap: mainMapResult.map,
    lateNightMap: lateNightResult.map,
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
