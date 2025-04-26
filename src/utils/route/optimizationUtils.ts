
import { LocationType } from '@/components/locations/LocationEditDialog';
import { OptimizationParams } from '@/hooks/routes/types';
import { calculateDistance } from './distanceUtils';

/**
 * Calculate a weight factor based on location characteristics for optimizations
 */
const calculateLocationFactor = (location: LocationType, prioritizeFuel: boolean): number => {
  let factor = 1.0;
  
  if (location.emptyCylinders && location.emptyCylinders > 0) {
    factor -= (location.emptyCylinders / 50) * 0.2;
  }
  
  if (prioritizeFuel) {
    const latitudeFactor = Math.abs(location.lat || 0) / 90;
    factor += latitudeFactor * 0.1;
  }
  
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
  if (middleLocations.length <= 1) return middleLocations;
  
  const optimizedOrder: LocationType[] = [];
  const unvisited = [...middleLocations];
  let currentLocation = startLocation;
  
  while (unvisited.length > 0) {
    let closestIndex = -1;
    let closestScore = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat || 0,
        currentLocation.long || 0,
        unvisited[i].lat || 0,
        unvisited[i].long || 0
      );
      
      const locationFactor = calculateLocationFactor(unvisited[i], params.prioritizeFuel);
      const trafficFactor = params.avoidTraffic ? 
        (params.useRealTimeData ? 0.7 : 0.85) : 1.0;
      const fuelFactor = params.prioritizeFuel ? 0.7 : 1.0;
      
      const score = distance * locationFactor * trafficFactor * fuelFactor;
      
      if (score < closestScore) {
        closestScore = score;
        closestIndex = i;
      }
    }
    
    if (closestIndex !== -1) {
      const nextLocation = unvisited[closestIndex];
      optimizedOrder.push(nextLocation);
      currentLocation = nextLocation;
      unvisited.splice(closestIndex, 1);
    }
  }
  
  return optimizedOrder;
};
