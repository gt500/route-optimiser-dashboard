
import { LocationType } from "@/components/locations/LocationEditDialog";

// Constants for accurate weight and fuel calculations - using consistent values
const EMPTY_CYLINDER_WEIGHT_KG = 22; // Weight of an empty cylinder in kg
const FULL_CYLINDER_WEIGHT_KG = 22;  // Weight of a full cylinder in kg
const CYLINDER_GAS_WEIGHT_KG = 0;   // No longer using different weights for gas content

// Average fuel consumption based on vehicle type and load (L/100km)
const BASE_FUEL_CONSUMPTION = 12; // 12L/100km for an average delivery truck
const LOAD_FACTOR = 0.02; // 2% increase in consumption per 100kg of load

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
 * Calculate total weight of all cylinders in a route
 */
export const calculateTotalWeight = (locations: LocationType[]): number => {
  let totalWeight = 0;
  
  locations.forEach(location => {
    // For customer locations with empty cylinders
    if (location.type === 'Customer' && location.emptyCylinders) {
      totalWeight += location.emptyCylinders * EMPTY_CYLINDER_WEIGHT_KG;
    }
    
    // For storage locations with full cylinders
    if ((location.type === 'Storage' || location.type === 'Distribution') && location.fullCylinders) {
      totalWeight += location.fullCylinders * FULL_CYLINDER_WEIGHT_KG;
    }
  });
  
  return totalWeight;
};

/**
 * Calculate fuel consumption based on distance, vehicle type, and load
 */
export const calculateFuelConsumption = (distance: number, totalWeight: number): number => {
  // Base consumption plus adjustment for load weight
  const weightFactor = 1 + (totalWeight / 100) * LOAD_FACTOR;
  return (distance * BASE_FUEL_CONSUMPTION * weightFactor) / 100;
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
    useRealTimeData: true,
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
      
      // Apply traffic avoidance - if we have real-time data
      const trafficFactor = params.avoidTraffic ? 
        (params.useRealTimeData ? 0.7 : 0.85) : 1.0;
        
      // Apply fuel efficiency preference  
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
      
      // Road curvature factor:
      // - Mountains/hills: 1.4-1.6 (more winding roads)
      // - Suburbs: 1.2-1.3 (grid street patterns)
      // - Highways: 1.1-1.2 (mostly straight)
      let curvatureFactor = 1.3; // Default suburban roads
      
      // Simple heuristic - if long distance, assume more highway portions
      if (distance > 20) curvatureFactor = 1.15;
      else if (distance > 5) curvatureFactor = 1.25;
      
      calculatedDistance += distance * curvatureFactor;
    }
  }
  
  // Calculate the total weight for fuel consumption calculation
  const totalWeight = calculateTotalWeight(locations);
  
  // Traffic multiplier affects both distance and duration
  let trafficMultiplier = 1.0;
  if (params.avoidTraffic) {
    trafficMultiplier = 0.9; // 10% reduction with traffic avoidance
  }
  
  // Fuel efficiency multiplier
  const fuelMultiplier = params.prioritizeFuel ? 0.9 : 1.0;
  
  // Distance optimization multiplier
  const distanceMultiplier = params.optimizeForDistance ? 0.9 : 1.05;
  
  let newDistance = calculatedDistance > 0 ? calculatedDistance : 45.7;
  let newDuration = calculatedDistance * 1.5; // Base calculation: 1.5 minutes per km
  let trafficConditions: 'light' | 'moderate' | 'heavy' = 'moderate';
  
  if (params.useRealTimeData) {
    // In a real application, this would come from a traffic API
    // Here we'll simulate with a reasonable variation
    const hourOfDay = new Date().getHours();
    let realTimeTrafficFactor = 1.0;
    
    // Simulate rush hour patterns
    if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)) {
      // Rush hour - heavier traffic 
      realTimeTrafficFactor = 1.3 + (Math.random() * 0.2); // 1.3-1.5x
      trafficConditions = 'heavy';
    } else if ((hourOfDay >= 10 && hourOfDay <= 15) || (hourOfDay >= 19 && hourOfDay <= 20)) {
      // Regular daytime
      realTimeTrafficFactor = 1.0 + (Math.random() * 0.2); // 1.0-1.2x
      trafficConditions = 'moderate';
    } else {
      // Early morning or late night
      realTimeTrafficFactor = 0.8 + (Math.random() * 0.1); // 0.8-0.9x
      trafficConditions = 'light';
    }
    
    // Apply the traffic factor to distance and duration
    newDistance = newDistance * distanceMultiplier;
    newDuration = newDuration * realTimeTrafficFactor * (1/distanceMultiplier);
  }
  
  // Calculate fuel consumption based on distance and load weight
  const fuelConsumption = calculateFuelConsumption(newDistance, totalWeight) * fuelMultiplier;
  
  // Use the provided fuel cost parameter to calculate the total cost
  const fuelCost = Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100;
  
  // Calculate maintenance cost (approximately R0.85 per km)
  const maintenanceCost = newDistance * 0.85;
  
  return {
    distance: Math.round(newDistance * 10) / 10,
    duration: Math.round(newDuration),
    fuelConsumption: Math.round(fuelConsumption * 100) / 100,
    fuelCost, // Now calculated with the provided fuel cost
    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
    totalCost: Math.round((fuelCost + maintenanceCost) * 100) / 100,
    trafficConditions,
    usingRealTimeData: params.useRealTimeData,
    totalWeight: Math.round(totalWeight)
  };
};
