
/**
 * This module provides functions to simulate Waze-like routing calculations
 * for more accurate travel time and distance estimates without requiring an API key.
 * 
 * Note: This is a simulation and not actual Waze data. For production use,
 * consider integrating with actual routing services via their APIs.
 */

// South African specific road patterns and traffic conditions
const SOUTH_AFRICA_TRAFFIC_PATTERNS = {
  // Hour-based traffic multipliers (0-23)
  hourlyFactors: [
    0.7, 0.6, 0.5, 0.5, 0.6, 0.9, 1.3, 1.8, 1.6, 1.2, // 0-9
    1.0, 1.1, 1.2, 1.0, 1.1, 1.2, 1.4, 1.7, 1.5, 1.3, // 10-19
    1.1, 0.9, 0.8, 0.7 // 20-23
  ],
  // Day of week multipliers (0 = Sunday, 6 = Saturday)
  dayFactors: [0.8, 1.2, 1.1, 1.1, 1.15, 1.25, 0.9],
  // Region-specific factors (applicable to South African cities)
  regionFactors: {
    "Cape Town": 1.15,
    "Johannesburg": 1.25,
    "Durban": 1.1,
    "Pretoria": 1.2,
    "Port Elizabeth": 1.05,
    "Bloemfontein": 0.95,
    "default": 1.0
  }
};

// Road type based distance and time adjustments
const ROAD_TYPE_FACTORS = {
  // Road type adjustment factors for South Africa
  HIGHWAY: { distanceFactor: 1.08, speedKmh: 100, trafficSensitivity: 0.7 },
  MAJOR_ROAD: { distanceFactor: 1.15, speedKmh: 70, trafficSensitivity: 1.0 },
  URBAN_ROAD: { distanceFactor: 1.25, speedKmh: 50, trafficSensitivity: 1.3 },
  SUBURBAN: { distanceFactor: 1.2, speedKmh: 60, trafficSensitivity: 1.1 },
  RURAL: { distanceFactor: 1.12, speedKmh: 80, trafficSensitivity: 0.8 },
  DIRT_ROAD: { distanceFactor: 1.3, speedKmh: 30, trafficSensitivity: 0.5 }
};

/**
 * Determines the road type based on the distance between two points
 */
export const determineRoadType = (distanceKm: number): keyof typeof ROAD_TYPE_FACTORS => {
  if (distanceKm >= 50) return "HIGHWAY";
  if (distanceKm >= 15) return "MAJOR_ROAD";
  if (distanceKm >= 8) return "RURAL";
  if (distanceKm >= 5) return "SUBURBAN";
  if (distanceKm >= 1) return "URBAN_ROAD";
  return "URBAN_ROAD";
};

/**
 * Calculates the current traffic multiplier based on time of day and region
 */
export const getCurrentTrafficMultiplier = (region: string = "default"): number => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  const hourFactor = SOUTH_AFRICA_TRAFFIC_PATTERNS.hourlyFactors[hour] || 1.0;
  const dayFactor = SOUTH_AFRICA_TRAFFIC_PATTERNS.dayFactors[day] || 1.0;
  const regionFactor = SOUTH_AFRICA_TRAFFIC_PATTERNS.regionFactors[region] || 
                       SOUTH_AFRICA_TRAFFIC_PATTERNS.regionFactors.default;
  
  return hourFactor * dayFactor * regionFactor;
};

/**
 * Simulates Waze-like routing calculations for a route segment
 */
export const calculateWazeSimulatedRoute = (
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number,
  region: string = "Cape Town",
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): { distance: number; duration: number } => {
  // Calculate direct distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLon = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directDistance = R * c;
  
  // Determine road type and adjustment factors
  const roadType = determineRoadType(directDistance);
  const { distanceFactor, speedKmh, trafficSensitivity } = ROAD_TYPE_FACTORS[roadType];
  
  // Apply traffic conditions
  let trafficMultiplier = getCurrentTrafficMultiplier(region);
  switch (trafficCondition) {
    case 'light': trafficMultiplier *= 0.8; break;
    case 'heavy': trafficMultiplier *= 1.4; break;
    default: break; // 'moderate' is the baseline
  }
  
  // Add some randomness to make it more realistic (±5-10%)
  const randomVariation = 0.9 + (Math.random() * 0.2);
  
  // Calculate adjusted road distance
  const roadDistance = directDistance * distanceFactor * randomVariation;
  
  // Adjusted speed based on traffic (more traffic = slower speed)
  const adjustedSpeed = speedKmh / (1 + (trafficMultiplier - 1) * trafficSensitivity);
  
  // Calculate duration in minutes
  const durationMinutes = (roadDistance / adjustedSpeed) * 60;
  
  // Add stops and intersections time
  const intersectionsPerKm = roadType === "URBAN_ROAD" ? 2 : 
                             roadType === "SUBURBAN" ? 1 : 0.3;
  const intersectionTime = roadDistance * intersectionsPerKm * 0.5; // 30 seconds per intersection on average
  
  // Final duration with added time for stops, traffic lights, etc.
  const totalDuration = durationMinutes + intersectionTime;
  
  return {
    distance: Number(roadDistance.toFixed(1)),
    duration: Number(totalDuration.toFixed(1))
  };
};

/**
 * Calculate a complete route with multiple waypoints using Waze-like simulation
 */
export const calculateWazeSimulatedMultiRoute = (
  waypoints: { latitude: number; longitude: number }[],
  region: string = "Cape Town",
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): { 
  totalDistance: number; 
  totalDuration: number; 
  segments: { distance: number; duration: number }[] 
} => {
  let totalDistance = 0;
  let totalDuration = 0;
  const segments: { distance: number; duration: number }[] = [];
  
  if (waypoints.length < 2) {
    return { totalDistance: 0, totalDuration: 0, segments: [] };
  }
  
  // Calculate each segment
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    
    // Skip if coordinates are missing
    if (!from.latitude || !from.longitude || !to.latitude || !to.longitude) {
      // Use defaults for missing coordinates
      const defaultSegment = { distance: 8.8, duration: 16 };
      segments.push(defaultSegment);
      totalDistance += defaultSegment.distance;
      totalDuration += defaultSegment.duration;
      continue;
    }
    
    const result = calculateWazeSimulatedRoute(
      from.latitude, 
      from.longitude, 
      to.latitude, 
      to.longitude, 
      region,
      trafficCondition
    );
    
    segments.push(result);
    totalDistance += result.distance;
    totalDuration += result.duration;
  }
  
  // Add loading/unloading time (8 minutes per stop)
  const stopTime = 8 * (waypoints.length);
  totalDuration += stopTime;
  
  return {
    totalDistance: Number(totalDistance.toFixed(1)),
    totalDuration: Number(totalDuration.toFixed(1)),
    segments
  };
};

/**
 * Get the current traffic condition based on time of day
 */
export const getCurrentTrafficCondition = (): 'light' | 'moderate' | 'heavy' => {
  const hour = new Date().getHours();
  
  // Morning and evening rush hours
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    return 'heavy';
  }
  // Late night and early morning
  if (hour >= 22 || hour <= 5) {
    return 'light';
  }
  // Default
  return 'moderate';
};
