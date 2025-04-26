
import { ROUTE_DISTANCE_CORRECTION } from './constants';

/**
 * Calculate distance between two sets of coordinates using the Haversine formula
 * This is an "as the crow flies" distance and will be used as a fallback
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
