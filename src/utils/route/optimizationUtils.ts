import { LocationType } from '@/components/locations/LocationEditDialog';
import { OptimizationParams } from '@/hooks/routes/types';
import { calculateDistance } from './distanceUtils';

/**
 * Calculate a weight factor based on location characteristics for optimizations
 */
const calculateLocationFactor = (location: LocationType, prioritizeFuel: boolean): number => {
  let factor = 1.0;
  
  // Apply weight factor based on number of empty cylinders
  if (location.emptyCylinders && location.emptyCylinders > 0) {
    factor -= (location.emptyCylinders / 50) * 0.2;
  }
  
  // Apply location-specific factors if prioritizing fuel
  if (prioritizeFuel) {
    const latitudeFactor = Math.abs(location.lat || 0) / 90;
    factor += latitudeFactor * 0.1;
  }
  
  // Keep factor within reasonable bounds
  return Math.max(0.5, Math.min(factor, 1.5));
};

/**
 * Optimize the order of locations based on a modified nearest neighbor algorithm
 * that considers fuel efficiency and load factors
 */
export const optimizeLocationOrder = (
  startLocation: LocationType,
  middleLocations: LocationType[],
  endLocation: LocationType,
  params: OptimizationParams = {
    prioritizeFuel: true,
    avoidTraffic: true,
    useRealTimeData: true,
    optimizeForDistance: true
  }
): LocationType[] => {
  // If we have 0 or 1 locations, no optimization needed
  if (!middleLocations || middleLocations.length <= 1) return middleLocations;
  
  console.log(`Optimizing ${middleLocations.length} locations between ${startLocation.name} and ${endLocation.name}`);
  
  const optimizedOrder: LocationType[] = [];
  const unvisited = [...middleLocations];
  let currentLocation = startLocation;
  
  // Use nearest neighbor algorithm with custom weights
  while (unvisited.length > 0) {
    let closestIndex = -1;
    let closestScore = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      // Skip locations with invalid coordinates
      if (unvisited[i].lat === undefined || unvisited[i].long === undefined ||
          currentLocation.lat === undefined || currentLocation.long === undefined) {
        continue;
      }
      
      // Calculate base distance
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.long,
        unvisited[i].lat,
        unvisited[i].long
      );
      
      // Apply custom factors
      const locationFactor = calculateLocationFactor(unvisited[i], params.prioritizeFuel);
      const trafficFactor = params.avoidTraffic ? 
        (params.useRealTimeData ? 0.7 : 0.85) : 1.0;
      const fuelFactor = params.prioritizeFuel ? 0.7 : 1.0;
      
      // Calculate final score (lower is better)
      const score = distance * locationFactor * trafficFactor * fuelFactor;
      
      if (score < closestScore) {
        closestScore = score;
        closestIndex = i;
      }
    }
    
    // Add the closest location to our optimized order
    if (closestIndex !== -1) {
      const nextLocation = unvisited[closestIndex];
      optimizedOrder.push(nextLocation);
      currentLocation = nextLocation;
      unvisited.splice(closestIndex, 1);
    } else {
      // If we can't find a valid next location, break to prevent infinite loop
      console.warn("Could not find valid next location in optimization, breaking loop");
      break;
    }
  }

  console.log(`Optimization complete. Original order had ${middleLocations.length} locations, optimized order has ${optimizedOrder.length} locations`);
  
  return optimizedOrder;
};
