
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
        5; // Default to 5km if we don't have a total
      
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
    
    // Apply road correction factors
    let roadFactor = 1.3; // Default urban road factor
    
    // Adjust factor based on distance (rough approximation of road type)
    if (directDistance > 15) {
      roadFactor = 1.5; // Highway/rural routes
    } else if (directDistance > 5) {
      roadFactor = 1.4; // Suburban routes
    } else if (directDistance < 1) {
      roadFactor = 1.2; // Very short urban trips
    }
    
    const roadDistance = directDistance * roadFactor;
    distances.push(roadDistance);
    totalCalculatedDistance += roadDistance;
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
  let avgSpeed = 60; // Default moderate traffic
  
  switch (trafficCondition) {
    case 'light':
      avgSpeed = 75;
      break;
    case 'moderate':
      avgSpeed = 60;
      break;
    case 'heavy':
      avgSpeed = 40;
      break;
  }
  
  // Adjust speed based on distance (approximation of road type)
  if (distanceKm > 100) {
    // Long highway routes are faster even in traffic
    avgSpeed = Math.min(avgSpeed * 1.3, 120);
  } else if (distanceKm > 50) {
    // Medium distance routes are a mix
    avgSpeed = Math.min(avgSpeed * 1.1, 100);
  } else if (distanceKm < 5) {
    // Very short urban trips are slower
    avgSpeed = Math.min(avgSpeed * 0.8, 40);
  }
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / avgSpeed;
  const timeMinutes = timeHours * 60;
  
  // Add minimum base time for very short trips (traffic lights, etc)
  return Math.max(5, Math.round(timeMinutes));
};

/**
 * Calculate the total route distance from an array of segment distances
 */
export const calculateTotalDistance = (distances: number[]): number => {
  return distances.reduce((sum, distance) => sum + distance, 0);
};
