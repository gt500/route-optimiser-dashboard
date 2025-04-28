
import { calculateDistance } from './distanceUtils';

/**
 * Calculate realistic road distances between a series of locations
 * @param locations Array of location objects with latitude and longitude
 * @param totalKnownDistance Optional known total distance for the entire route
 * @returns Array of distances between consecutive locations
 */
export const calculateRoadDistances = (
  locations: { latitude: number; longitude: number }[],
  totalKnownDistance?: number
): number[] => {
  const distances: number[] = [];
  let totalCalculatedDistance = 0;
  
  // If we don't have enough locations
  if (locations.length <= 1) {
    return [0];
  }
  
  // Calculate direct distances and apply road correction factors
  for (let i = 0; i < locations.length - 1; i++) {
    const current = locations[i];
    const next = locations[i + 1];
    
    // Skip if we don't have coordinates for either location
    if (!current.latitude || !current.longitude || !next.latitude || !next.longitude) {
      const defaultDistance = totalKnownDistance ? 
        totalKnownDistance / (locations.length - 1) : 
        15; // Default to 15km if we don't have a total - increased from 10km for more realism
      
      distances.push(defaultDistance);
      totalCalculatedDistance += defaultDistance;
      continue;
    }
    
    // Calculate direct distance
    const directDistance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    
    // Apply road correction factors - adjusted for more realistic values
    let roadFactor = 1.4; // Default urban road factor 
    
    // Adjust factor based on distance (rough approximation of road type)
    if (directDistance > 15) {
      roadFactor = 1.6; // Highway/rural routes with more winding roads
    } else if (directDistance > 5) {
      roadFactor = 1.5; // Suburban routes with more intersections
    } else if (directDistance < 1) {
      roadFactor = 1.8; // Very short urban trips often involve more detours
    }
    
    // Apply increased factor for specific location pairs that are known to have difficult routes
    // This would ideally come from a database of known difficult routes
    const roadDistance = directDistance * roadFactor;
    
    // Minimum realistic distance between stops (accounts for local roads, one-way streets, etc.)
    const minDistance = Math.max(1.0, roadDistance);
    
    distances.push(minDistance);
    totalCalculatedDistance += minDistance;
  }
  
  // If we have a known total distance, scale all segments proportionally
  if (totalKnownDistance && totalKnownDistance > 0 && totalCalculatedDistance > 0) {
    const scaleFactor = totalKnownDistance / totalCalculatedDistance;
    
    // Only scale if there's a significant difference
    if (scaleFactor < 0.8 || scaleFactor > 1.2) {
      for (let i = 0; i < distances.length; i++) {
        distances[i] = distances[i] * scaleFactor;
      }
    }
  }
  
  return distances;
};

/**
 * Estimate travel time for a given distance based on traffic conditions
 * @param distanceKm Distance in kilometers
 * @param trafficCondition Traffic condition (light, moderate, heavy)
 * @returns Estimated time in minutes
 */
export const estimateTravelTime = (
  distanceKm: number,
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): number => {
  // Base speed based on traffic conditions (km/h)
  let avgSpeed = 50; // Default moderate traffic - reduced from 60 for more realism in urban areas
  
  switch (trafficCondition) {
    case 'light':
      avgSpeed = 65; // Reduced from 75 for more realism
      break;
    case 'moderate':
      avgSpeed = 50; // Reduced from 60 for more realism
      break;
    case 'heavy':
      avgSpeed = 35; // Reduced from 40 for more realism
      break;
  }
  
  // Adjust speed based on distance (approximation of road type)
  if (distanceKm > 100) {
    // Long highway routes are faster even in traffic
    avgSpeed = Math.min(avgSpeed * 1.3, 100); // Reduced max speed from 120 for more realism
  } else if (distanceKm > 50) {
    // Medium distance routes are a mix
    avgSpeed = Math.min(avgSpeed * 1.1, 85); // Reduced from 100 for more realism
  } else if (distanceKm < 5) {
    // Very short urban trips are slower
    avgSpeed = Math.min(avgSpeed * 0.7, 35); // Reduced factor for more realism
  }
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / avgSpeed;
  const timeMinutes = timeHours * 60;
  
  // Add minimum base time for very short trips (traffic lights, etc)
  // Increased from 5 to 8 minutes minimum for more realism (account for parking, loading/unloading)
  return Math.max(8, Math.round(timeMinutes));
};

/**
 * Calculate the total route distance from an array of segment distances
 */
export const calculateTotalDistance = (distances: number[]): number => {
  return distances.reduce((sum, distance) => sum + distance, 0);
};

/**
 * Calculate segment-by-segment distances for debugging and display
 */
export const calculateSegmentDistances = (
  locations: { latitude: number; longitude: number }[]
): { direct: number; road: number; }[] => {
  const segments: { direct: number; road: number; }[] = [];
  
  if (locations.length <= 1) {
    return segments;
  }
  
  for (let i = 0; i < locations.length - 1; i++) {
    const current = locations[i];
    const next = locations[i + 1];
    
    if (!current.latitude || !current.longitude || !next.latitude || !next.longitude) {
      segments.push({ direct: 0, road: 15 });
      continue;
    }
    
    const directDistance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    
    // Apply road correction factors
    let roadFactor = 1.4;
    
    if (directDistance > 15) {
      roadFactor = 1.6;
    } else if (directDistance > 5) {
      roadFactor = 1.5;
    } else if (directDistance < 1) {
      roadFactor = 1.8;
    }
    
    const roadDistance = directDistance * roadFactor;
    segments.push({ direct: directDistance, road: roadDistance });
  }
  
  return segments;
};
