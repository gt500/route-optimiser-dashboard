
import { 
  ROUTE_DISTANCE_CORRECTION,
  AVG_SPEED_URBAN_KM_H,
  AVG_SPEED_SUBURBAN_KM_H, 
  AVG_SPEED_RURAL_KM_H,
  AVG_SPEED_HIGHWAY_KM_H,
  MIN_STOP_TIME_MINUTES
} from './constants';

// Calculate straight-line distance between two points in kilometers
export function calculateDirectDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Convert direct distance to road distance based on terrain type
export function directToRoadDistance(
  directDistance: number, 
  terrainType: keyof typeof ROUTE_DISTANCE_CORRECTION = 'SUBURBAN'
): number {
  const factor = ROUTE_DISTANCE_CORRECTION[terrainType] || ROUTE_DISTANCE_CORRECTION.SUBURBAN;
  return directDistance * factor;
}

// Calculate travel time in minutes based on distance and average speed
export function calculateTravelTime(
  distanceKm: number, 
  terrainType: keyof typeof ROUTE_DISTANCE_CORRECTION = 'SUBURBAN',
  trafficFactor: number = 1.0 // 1.0 = normal, 1.3 = heavy, 0.8 = light
): number {
  let avgSpeed;
  
  switch(terrainType) {
    case 'URBAN':
      avgSpeed = AVG_SPEED_URBAN_KM_H;
      break;
    case 'RURAL':
      avgSpeed = AVG_SPEED_RURAL_KM_H;
      break;
    case 'HIGHWAY':
      avgSpeed = AVG_SPEED_HIGHWAY_KM_H;
      break;
    case 'SUBURBAN':
    default:
      avgSpeed = AVG_SPEED_SUBURBAN_KM_H;
  }
  
  // Apply traffic factor to speed (lower speed in heavy traffic)
  const adjustedSpeed = avgSpeed / trafficFactor;
  
  // Calculate minutes: (distanceKm / speed_km_per_hour) * 60 minutes
  const drivingMinutes = (distanceKm / adjustedSpeed) * 60;
  
  // Add fixed stop time to make calculations more realistic
  return Math.max(1, drivingMinutes) + MIN_STOP_TIME_MINUTES;
}

// Get appropriate terrain type based on distance
export function determineTerrainType(distance: number): keyof typeof ROUTE_DISTANCE_CORRECTION {
  if (distance < 2) return 'URBAN'; 
  if (distance < 10) return 'SUBURBAN';
  if (distance < 30) return 'RURAL';
  return 'HIGHWAY';
}

// Get traffic factor based on traffic condition
export function getTrafficFactor(trafficCondition: 'light' | 'moderate' | 'heavy'): number {
  switch(trafficCondition) {
    case 'light': return 0.85;  // 15% faster than normal
    case 'heavy': return 1.25;  // 25% slower than normal
    case 'moderate': 
    default: return 1.0;       // normal conditions
  }
}

// Calculate waypoint data for a series of coordinates
export function calculateWaypointData(
  coordinates: Array<{lat: number, long: number}>,
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): Array<{distance: number, duration: number}> {
  if (!coordinates || coordinates.length < 2) {
    return [];
  }
  
  const trafficFactor = getTrafficFactor(trafficCondition);
  const results: Array<{distance: number, duration: number}> = [];
  
  // First point always has zero distance/duration
  results.push({ distance: 0, duration: 0 });
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    
    // Calculate direct distance
    const directDist = calculateDirectDistance(
      start.lat, start.long, end.lat, end.long
    );
    
    // Determine terrain type based on distance
    const terrainType = determineTerrainType(directDist);
    
    // Convert to road distance
    const roadDist = directToRoadDistance(directDist, terrainType);
    
    // Calculate travel time
    const travelTime = calculateTravelTime(roadDist, terrainType, trafficFactor);
    
    // Add to results (skip first point which is already added with zeros)
    if (i > 0) {
      results.push({
        distance: parseFloat(roadDist.toFixed(2)),
        duration: parseFloat(travelTime.toFixed(1))
      });
    }
  }
  
  return results;
}

// Calculate total route distance and duration
export function calculateRouteMetrics(
  coordinates: Array<{lat: number, long: number}>,
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): {totalDistance: number, totalDuration: number, waypointData: Array<{distance: number, duration: number}>} {
  const waypointData = calculateWaypointData(coordinates, trafficCondition);
  
  // Calculate totals from waypoint data
  const totalDistance = waypointData.reduce((sum, point) => sum + point.distance, 0);
  const totalDuration = waypointData.reduce((sum, point) => sum + point.duration, 0);
  
  return {
    totalDistance: Math.max(0.1, parseFloat(totalDistance.toFixed(2))),
    totalDuration: Math.max(1, parseFloat(totalDuration.toFixed(1))),
    waypointData
  };
}
