
/**
 * Utilities for handling traffic data and visualization in route maps
 */

export type TrafficLevel = 'light' | 'moderate' | 'heavy';

export interface TrafficSegment {
  start: [number, number];
  end: [number, number];
  level: TrafficLevel;
  distance?: number;
  duration?: number;
}

/**
 * Get color for traffic visualization based on traffic level
 */
export const getTrafficColor = (level: TrafficLevel): string => {
  switch (level) {
    case 'light':
      return '#22c55e'; // green
    case 'moderate':
      return '#f59e0b'; // amber
    case 'heavy':
      return '#ef4444'; // red
    default:
      return '#3b82f6'; // default blue
  }
};

/**
 * Get traffic level based on speed factor
 * Speed factor is the ratio between the actual travel time and the expected travel time
 * in ideal conditions (no traffic)
 */
export const getTrafficLevelBySpeedFactor = (speedFactor: number): TrafficLevel => {
  if (speedFactor < 1.2) return 'light';      // Less than 20% slowdown
  if (speedFactor < 1.8) return 'moderate';   // Between 20% and 80% slowdown
  return 'heavy';                             // More than 80% slowdown
};

/**
 * Convert regular route coordinates to traffic segments with traffic level information
 */
export const analyzeTrafficFromCoordinates = (
  coordinates: [number, number][],
  segmentDurations: number[] = []
): TrafficSegment[] => {
  if (coordinates.length < 2) return [];
  
  const segments: TrafficSegment[] = [];
  
  // If no segment durations provided, create segments with moderate traffic by default
  if (segmentDurations.length === 0) {
    for (let i = 0; i < coordinates.length - 1; i++) {
      segments.push({
        start: coordinates[i],
        end: coordinates[i + 1],
        level: 'moderate'
      });
    }
    return segments;
  }
  
  // Create segments with traffic level based on durations
  const avgDuration = segmentDurations.reduce((sum, dur) => sum + dur, 0) / segmentDurations.length;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    if (i < segmentDurations.length) {
      const speedFactor = segmentDurations[i] / avgDuration;
      segments.push({
        start: coordinates[i],
        end: coordinates[i + 1],
        level: getTrafficLevelBySpeedFactor(speedFactor),
        duration: segmentDurations[i]
      });
    } else {
      segments.push({
        start: coordinates[i],
        end: coordinates[i + 1],
        level: 'moderate'
      });
    }
  }
  
  return segments;
};
