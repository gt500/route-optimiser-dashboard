
import { ROUTE_DISTANCE_CORRECTION } from './constants';

/**
 * Calculate distance between two sets of coordinates using the Haversine formula
 * This is an "as the crow flies" distance and will be used as a fallback
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Validate inputs to prevent NaN results
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.warn('Invalid coordinates in calculateDistance:', { lat1, lon1, lat2, lon2 });
    return 0;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directDistance = R * c;

  // Apply a road distance correction factor based on the direct distance
  // Shorter distances tend to have more variance from direct path
  let correctionFactor = ROUTE_DISTANCE_CORRECTION.URBAN;
  
  if (directDistance > 20) {
    correctionFactor = ROUTE_DISTANCE_CORRECTION.HIGHWAY;
  } else if (directDistance > 10) {
    correctionFactor = ROUTE_DISTANCE_CORRECTION.RURAL;
  } else if (directDistance > 5) {
    correctionFactor = ROUTE_DISTANCE_CORRECTION.SUBURBAN;
  }
  
  return directDistance * correctionFactor;
};

/**
 * Calculate the road distance between two points with correction factors
 * for different types of roads with realistic variability
 */
export const calculateRoadDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  roadType: 'urban' | 'suburban' | 'rural' | 'highway' = 'urban'
): number => {
  // Get direct distance first
  const directDistance = calculateDistance(lat1, lon1, lat2, lon2);
  
  // Apply correction factors based on road type
  let roadFactor: number;
  
  switch (roadType) {
    case 'highway':
      roadFactor = ROUTE_DISTANCE_CORRECTION.HIGHWAY;
      break;
    case 'rural':
      roadFactor = ROUTE_DISTANCE_CORRECTION.RURAL;
      break;
    case 'suburban':
      roadFactor = ROUTE_DISTANCE_CORRECTION.SUBURBAN;
      break;
    case 'urban':
    default:
      roadFactor = ROUTE_DISTANCE_CORRECTION.URBAN;
  }
  
  // Add slight variability to make different segments unique
  const variability = 0.9 + (Math.random() * 0.2);
  
  return directDistance * roadFactor * variability;
};

/**
 * Auto-detect the most likely road type based on distance
 */
export const detectRoadType = (
  distanceKm: number
): 'urban' | 'suburban' | 'rural' | 'highway' => {
  if (distanceKm > 20) {
    return 'highway';
  } else if (distanceKm > 10) {
    return 'rural';
  } else if (distanceKm > 5) {
    return 'suburban';
  } else {
    return 'urban';
  }
};
