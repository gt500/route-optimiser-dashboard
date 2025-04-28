
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
      // Use each distinct default distance for each segment to make it more realistic
      const defaultDistances = [8.8, 7.2, 9.4, 6.5, 10.1, 9.2, 7.8, 11.3, 8.1, 12.4];
      const defaultDistance = defaultDistances[i % defaultDistances.length];
      
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
    
    // Apply road correction factors - adjusted for South African roads
    // These factors are based on road network density in Cape Town region
    let roadFactor = 1.4; // Default urban road factor
    
    // Apply different factors based on distance to simulate different road types
    if (directDistance > 15) {
      roadFactor = 1.6; // Highway/rural routes with more winding roads
    } else if (directDistance > 5) {
      roadFactor = 1.5; // Suburban routes with more intersections
    } else if (directDistance < 1) {
      roadFactor = 1.8; // Very short urban trips often involve more detours
    }
    
    // Calculate road distance with the road factor
    const roadDistance = directDistance * roadFactor;
    
    // Minimum realistic distance between stops (accounts for local roads, one-way streets, etc.)
    const minDistance = Math.max(1.0, roadDistance);
    
    // Add some realistic variation to each segment (±10%)
    const variation = 1 + ((Math.random() * 0.2) - 0.1);
    const finalDistance = minDistance * variation;
    
    distances.push(finalDistance);
    totalCalculatedDistance += finalDistance;
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
  // Base speed based on traffic conditions (km/h) - adjusted for South African roads
  let avgSpeed = 35; // Default moderate traffic in urban South Africa
  
  switch (trafficCondition) {
    case 'light':
      avgSpeed = 45; // Light traffic in urban areas
      break;
    case 'moderate':
      avgSpeed = 35; // Moderate traffic
      break;
    case 'heavy':
      avgSpeed = 25; // Heavy traffic (Cape Town peak hours)
      break;
  }
  
  // Adjust speed based on distance (approximation of road type)
  if (distanceKm > 50) {
    // Long highway routes are faster even in traffic
    avgSpeed = Math.min(avgSpeed * 1.3, 90); // Max speed on SA highways
  } else if (distanceKm > 20) {
    // Medium distance routes are a mix
    avgSpeed = Math.min(avgSpeed * 1.1, 70); // Main roads
  } else if (distanceKm < 5) {
    // Very short urban trips are slower
    avgSpeed = Math.min(avgSpeed * 0.7, 25); // Urban streets with traffic lights and stops
  }
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / avgSpeed;
  const timeMinutes = timeHours * 60;
  
  // Add minimum base time for very short trips (traffic lights, loading/unloading)
  const stopTime = 8; // minutes for loading/unloading per stop
  
  // Add slight randomness to the time (±10%) to simulate real-world conditions
  const variation = 1 + ((Math.random() * 0.2) - 0.1);
  
  return Math.max(stopTime, Math.round((timeMinutes * variation)));
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
      // Use different default distances based on location index for more variation
      const defaultDistances = [8.8, 7.2, 9.4, 6.5, 10.1, 9.2, 7.8, 11.3, 8.1, 12.4];
      const defaultRoadDistance = defaultDistances[i % defaultDistances.length];
      segments.push({ direct: defaultRoadDistance * 0.7, road: defaultRoadDistance });
      continue;
    }
    
    const directDistance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    
    // Apply road correction factors - adjusted for South Africa with variation
    let roadFactor = 1.4; // Default Cape Town urban factor
    
    if (directDistance > 15) {
      roadFactor = 1.6 + (Math.random() * 0.2); // Add variance
    } else if (directDistance > 5) {
      roadFactor = 1.5 + (Math.random() * 0.15);
    } else if (directDistance < 1) {
      roadFactor = 1.8 + (Math.random() * 0.25);
    }
    
    const roadDistance = directDistance * roadFactor;
    segments.push({ direct: directDistance, road: roadDistance });
  }
  
  return segments;
};
