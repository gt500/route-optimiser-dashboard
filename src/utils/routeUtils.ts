
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { OptimizationParams } from '@/hooks/routes/types';

// Constants for accurate weight and fuel calculations - using consistent values
const EMPTY_WEIGHT_KG = EMPTY_CYLINDER_WEIGHT_KG;    // 12kg per empty
const FULL_CYLINDER_WEIGHT_KG = CYLINDER_WEIGHT_KG;  // 22kg per full

// Average fuel consumption based on vehicle type and load (L/100km)
const BASE_FUEL_CONSUMPTION = 12; // 12L/100km for an average delivery truck
const LOAD_FACTOR = 0.02; // 2% increase in consumption per 100kg of load

// Constants for time calculation
const AVG_SPEED_URBAN_KM_H = 35; // Average speed in urban areas
const AVG_SPEED_RURAL_KM_H = 60; // Average speed in rural areas
const MIN_STOP_TIME_MINUTES = 15; // Minimum time at each stop

// Route distance correction factors based on road types
const ROUTE_DISTANCE_CORRECTION = {
  URBAN: 1.4,    // Urban areas have more turns and traffic lights
  SUBURBAN: 1.3, // Suburban areas have some turns and lights
  RURAL: 1.15,   // Rural areas have fewer turns but may be winding
  HIGHWAY: 1.1   // Highways are mostly straight
};

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

/**
 * Calculate total payload weight for a truck considering both fulls (before delivery)
 * and empties (AFTER delivery at each site, empties are now on-board at 12kg each),
 * respecting the business rule.
 */
export const calculateTotalWeight = (locations: LocationType[]): number => {
  let totalWeight = 0;
  let runningFulls = 0;
  let runningEmpties = 0;
  
  locations.forEach((loc, idx) => {
    // Assume "Customer" sites: Deliver fulls, collect empties (post-delivery).
    if ((loc.type === 'Customer' || loc.type === 'Distribution' || loc.type === 'Storage')) {
      if (loc.fullCylinders && loc.fullCylinders > 0) {
        runningFulls += loc.fullCylinders;
      }
      // When dropping off fulls to customer, add empties right after the drop
      if (loc.emptyCylinders && loc.emptyCylinders > 0) {
        runningEmpties += loc.emptyCylinders;
      }
    }
  });

  // The max weight during the trip: Truck is heaviest with all fulls at start,
  // but as you deliver, fulls are swapped for empties.
  // For simplicity in indicator, we show max(runningFulls*full, runningEmpties*empty)
  totalWeight = Math.max(runningFulls * FULL_CYLINDER_WEIGHT_KG, runningEmpties * EMPTY_WEIGHT_KG);

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
 * with support for custom fuel cost and detailed waypoint data
 */
export const calculateRouteMetrics = (
  locations: LocationType[],
  params: OptimizationParams,
  fuelCostPerLiter: number = 21.95, // Add fuel cost parameter with default value
  routingMachineData?: {
    totalDistance?: number,
    totalDuration?: number,
    waypointData?: { distance: number, duration: number }[]
  }
) => {
  let calculatedDistance = 0;
  let calculatedDuration = 0;
  let useRoutingMachineData = false;
  
  // First check if we have accurate routing machine data
  if (routingMachineData && routingMachineData.totalDistance && routingMachineData.totalDistance > 0) {
    calculatedDistance = routingMachineData.totalDistance;
    calculatedDuration = routingMachineData.totalDuration || 0;
    useRoutingMachineData = true;
  } 
  // Fallback to Haversine distance calculation if no routing machine data
  else if (locations.length > 1) {
    for (let i = 0; i < locations.length - 1; i++) {
      const lat1 = locations[i].lat || 0;
      const lon1 = locations[i].long || 0;
      const lat2 = locations[i + 1].lat || 0;
      const lon2 = locations[i + 1].long || 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      calculatedDistance += distance;
    }
  }
  
  // If we still don't have a valid distance, use a default
  if (calculatedDistance <= 0) {
    calculatedDistance = 45.7; // Default distance if calculation fails
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
  
  // If we don't have duration from routing machine, calculate it
  if (!useRoutingMachineData || calculatedDuration <= 0) {
    // Base calculation: time = distance / average speed + time per stop
    let avgSpeed = AVG_SPEED_URBAN_KM_H; // Default to urban speed
    
    // If route is longer, assume more rural/highway portions
    if (newDistance > 50) {
      avgSpeed = (AVG_SPEED_URBAN_KM_H + AVG_SPEED_RURAL_KM_H) / 2; // Mix of urban and rural
    } else if (newDistance > 100) {
      avgSpeed = AVG_SPEED_RURAL_KM_H; // Mostly rural/highway
    }
    
    // Calculate driving time in minutes
    const drivingTimeMinutes = (newDistance / avgSpeed) * 60;
    
    // Add stop time for each location (minimum 15 minutes per stop)
    const numStops = locations.length;
    const stopTimeMinutes = numStops * MIN_STOP_TIME_MINUTES;
    
    // Total duration in minutes
    calculatedDuration = drivingTimeMinutes + stopTimeMinutes;
  }
  
  // Apply traffic conditions
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
    
    // Apply traffic factor to duration if not using routing machine data
    if (!useRoutingMachineData) {
      calculatedDuration = calculatedDuration * realTimeTrafficFactor;
    }
    
    // Apply distance optimization
    newDistance = newDistance * distanceMultiplier;
  }
  
  // Ensure minimum duration - a route should never take less than 15 minutes per stop
  calculatedDuration = Math.max(calculatedDuration, locations.length * MIN_STOP_TIME_MINUTES);
  
  // Calculate fuel consumption based on distance and load weight
  const fuelConsumption = calculateFuelConsumption(newDistance, totalWeight) * fuelMultiplier;
  
  // Use the provided fuel cost parameter to calculate the total cost
  const fuelCost = Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100;
  
  // Calculate maintenance cost (approximately R0.85 per km)
  const maintenanceCost = newDistance * 0.85;
  
  return {
    distance: Math.round(newDistance * 10) / 10,
    duration: Math.round(calculatedDuration),
    fuelConsumption: Math.round(fuelConsumption * 100) / 100,
    fuelCost, // Now calculated with the provided fuel cost
    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
    totalCost: Math.round((fuelCost + maintenanceCost) * 100) / 100,
    trafficConditions,
    usingRealTimeData: params.useRealTimeData,
    totalWeight: Math.round(totalWeight),
    waypointData: routingMachineData?.waypointData
  };
};
