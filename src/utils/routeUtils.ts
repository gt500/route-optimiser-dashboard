
import { LocationType } from "@/components/locations/LocationEditDialog";

/**
 * Calculate distance between two sets of coordinates using the Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Optimize the order of locations based on the nearest neighbor algorithm
 */
export const optimizeLocationOrder = (
  startLocation: LocationType,
  middleLocations: LocationType[],
  endLocation: LocationType
): LocationType[] => {
  if (middleLocations.length <= 1) return middleLocations;
  
  const optimizedOrder: LocationType[] = [];
  const unvisited = [...middleLocations];
  
  let currentLocation = startLocation;
  
  while (unvisited.length > 0) {
    let closestIndex = -1;
    let closestDistance = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat || 0,
        currentLocation.long || 0,
        unvisited[i].lat || 0,
        unvisited[i].long || 0
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
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

export interface OptimizationParams {
  prioritizeFuel: boolean;
  avoidTraffic: boolean;
  useRealTimeData: boolean;
  optimizeForDistance: boolean;
}

/**
 * Calculate route metrics based on locations and optimization parameters
 */
export const calculateRouteMetrics = (
  locations: LocationType[],
  params: OptimizationParams
) => {
  let calculatedDistance = 0;
  
  if (locations.length > 1) {
    for (let i = 0; i < locations.length - 1; i++) {
      const lat1 = locations[i].lat || 0;
      const lon1 = locations[i].long || 0;
      const lat2 = locations[i + 1].lat || 0;
      const lon2 = locations[i + 1].long || 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      calculatedDistance += distance * 1.3; // Adding a road curvature factor
    }
  }
  
  const trafficMultiplier = params.avoidTraffic ? 0.85 : 1.1;
  const fuelMultiplier = params.prioritizeFuel ? 0.9 : 1.0;
  const distanceMultiplier = params.optimizeForDistance ? 0.9 : 1.05;
  
  let newDistance = calculatedDistance || 45.7;
  let newDuration = calculatedDistance * 1.5;
  let trafficConditions: 'light' | 'moderate' | 'heavy' = 'moderate';
  
  if (params.useRealTimeData) {
    const realTimeTrafficFactor = 0.8 + Math.random() * 0.4;
    newDistance = newDistance * distanceMultiplier * realTimeTrafficFactor;
    newDuration = newDuration * (1/distanceMultiplier) * realTimeTrafficFactor;
    
    if (realTimeTrafficFactor < 0.9) trafficConditions = 'light';
    if (realTimeTrafficFactor > 1.1) trafficConditions = 'heavy';
  }
  
  const fuelConsumption = Math.round(newDistance * 0.12 * fuelMultiplier * 100) / 100;
  
  return {
    distance: Math.round(newDistance * 10) / 10,
    duration: Math.round(newDuration),
    fuelConsumption,
    trafficConditions,
    usingRealTimeData: params.useRealTimeData
  };
};
