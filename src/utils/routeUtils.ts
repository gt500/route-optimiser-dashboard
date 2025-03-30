
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
 * Calculate a weight factor based on location characteristics for optimizations
 */
const calculateLocationFactor = (location: LocationType, prioritizeFuel: boolean): number => {
  // Adjust this weight calculation based on what makes a location more or less expensive to visit
  // For example, if the location has a lot of cylinders, it might be more important to visit
  let factor = 1.0;
  
  // If location has empty cylinders, prioritize it
  if (location.emptyCylinders && location.emptyCylinders > 0) {
    // The more cylinders, the more important the stop
    factor -= (location.emptyCylinders / 50) * 0.2; // Up to 20% reduction for locations with more cylinders
  }
  
  // If fuel efficiency is prioritized, add additional factors
  if (prioritizeFuel) {
    // For example, altitude, road type, etc. could affect fuel consumption
    // Here using a simple approximation - locations with higher latitude may involve more hills
    const latitudeFactor = Math.abs(location.lat || 0) / 90; // Normalize to 0-1
    factor += latitudeFactor * 0.1; // Up to 10% increase for hilly areas
  }
  
  return Math.max(0.5, Math.min(factor, 1.5)); // Constrain factor between 0.5 and 1.5
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
    useRealTimeData: false,
    optimizeForDistance: true
  }
): LocationType[] => {
  if (middleLocations.length <= 1) return middleLocations;
  
  const optimizedOrder: LocationType[] = [];
  const unvisited = [...middleLocations];
  
  let currentLocation = startLocation;
  
  // Continue until all locations are visited
  while (unvisited.length > 0) {
    let closestIndex = -1;
    let closestScore = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      // Calculate raw distance
      const distance = calculateDistance(
        currentLocation.lat || 0,
        currentLocation.long || 0,
        unvisited[i].lat || 0,
        unvisited[i].long || 0
      );
      
      // Apply modifiers based on optimization parameters
      const locationFactor = calculateLocationFactor(unvisited[i], params.prioritizeFuel);
      const trafficFactor = params.avoidTraffic ? 0.8 : 1.0;
      const fuelFactor = params.prioritizeFuel ? 0.7 : 1.0;
      
      // Calculate weighted score (lower is better)
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

export interface OptimizationParams {
  prioritizeFuel: boolean;
  avoidTraffic: boolean;
  useRealTimeData: boolean;
  optimizeForDistance: boolean;
}

/**
 * Calculate route metrics based on locations and optimization parameters
 * with support for custom fuel cost
 */
export const calculateRouteMetrics = (
  locations: LocationType[],
  params: OptimizationParams,
  fuelCostPerLiter: number = 21.95 // Add fuel cost parameter with default value
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
  // Use the provided fuel cost parameter to calculate the total cost
  const fuelCost = Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100;
  
  return {
    distance: Math.round(newDistance * 10) / 10,
    duration: Math.round(newDuration),
    fuelConsumption,
    fuelCost, // Now calculated with the provided fuel cost
    trafficConditions,
    usingRealTimeData: params.useRealTimeData
  };
};
