
import { LocationType } from '@/types/location';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG, MAX_CYLINDERS } from '@/hooks/routes/types';

/**
 * Calculate total payload weight for a truck considering both full cylinders 
 * at the beginning of the route and empties collected during deliveries.
 * 
 * The truck starts with full cylinders and gradually exchanges them for empty ones,
 * so we need to calculate the weight at each point of the journey to find the maximum.
 * 
 * Note: Start and end points are excluded from weight calculations.
 */
export const calculateTotalWeight = (locations: LocationType[], 
                                     startLocationId?: string | null, 
                                     endLocationId?: string | null): number => {
  // If no locations, return 0 weight
  if (!locations || locations.length === 0) {
    return 0;
  }
  
  // Filter out start and end locations from weight calculations
  const routeLocations = locations.filter(loc => 
    loc.id !== startLocationId && 
    loc.id !== endLocationId
  );
  
  if (routeLocations.length === 0) {
    return 0;
  }
  
  // Track weight changes through the journey
  let fullCylindersOnBoard = 0;
  let emptyCylindersOnBoard = 0;
  let maxWeight = 0;
  
  // First load full cylinders from storage/depot locations
  for (const loc of routeLocations) {
    if (loc.type === 'Storage' || loc.type === 'Depot') {
      if (loc.fullCylinders) {
        fullCylindersOnBoard += loc.fullCylinders;
      }
    }
  }
  
  // For customer locations, count the cylinders we need to deliver
  for (const loc of routeLocations) {
    if (loc.type === 'Customer' || loc.type === 'Distribution') {
      // For each customer location, we need to deliver cylinders
      fullCylindersOnBoard += (loc.emptyCylinders || 0);
    }
  }
  
  // Calculate initial weight with all full cylinders - this is what we load at the start
  const initialWeight = fullCylindersOnBoard * CYLINDER_WEIGHT_KG;
  maxWeight = initialWeight;
  
  console.log(`Initial load: ${fullCylindersOnBoard} full cylinders (${initialWeight}kg)`);
  
  // Now simulate the route - at each customer location:
  // 1. Deliver full cylinders (reduce count on board)
  // 2. Collect empty cylinders (increase empty count)
  // 3. Calculate current weight after this exchange
  let currentWeight = initialWeight;
  
  for (const loc of routeLocations) {
    // For customer locations, we deliver fulls and collect empties
    if (loc.type === 'Customer' || loc.type === 'Distribution') {
      // The number of cylinders being delivered at this stop
      const fullsToDeliver = loc.emptyCylinders || 0;
      
      // Can't deliver more than what's on board
      const actualFullsDelivered = Math.min(fullCylindersOnBoard, fullsToDeliver);
      
      // Adjust on-board counts
      fullCylindersOnBoard -= actualFullsDelivered;
      
      // Collect empty cylinders
      const emptiesToCollect = loc.emptyCylinders || 0;
      emptyCylindersOnBoard += emptiesToCollect;
      
      // Calculate current weight after this stop
      currentWeight = 
        (fullCylindersOnBoard * CYLINDER_WEIGHT_KG) + 
        (emptyCylindersOnBoard * EMPTY_CYLINDER_WEIGHT_KG);
        
      console.log(`Stop at ${loc.name}: Delivered ${actualFullsDelivered} fulls, collected ${emptiesToCollect} empties. New weight: ${currentWeight}kg`);
      
      // Update max weight if this is higher
      maxWeight = Math.max(maxWeight, currentWeight);
    }
  }
  
  console.log(`Maximum weight during route: ${maxWeight}kg`);
  return maxWeight;
};

/**
 * Calculate weight at each point in the route to show progression
 */
export const calculateRouteWeightProfile = (locations: LocationType[], 
                                           startLocationId?: string | null, 
                                           endLocationId?: string | null): {
  location: string;
  weight: number;
  fullCylinders: number;
  emptyCylinders: number;
}[] => {
  if (!locations || locations.length === 0) {
    return [];
  }
  
  // Filter out start/end locations
  const routeLocations = locations.filter(loc => 
    loc.id !== startLocationId && 
    loc.id !== endLocationId
  );
  
  if (routeLocations.length === 0) {
    return [];
  }
  
  const weightProfile = [];
  let fullCylindersOnBoard = 0;
  let emptyCylindersOnBoard = 0;
  
  // First load from storage/depot
  for (const loc of routeLocations) {
    if (loc.type === 'Storage' || loc.type === 'Depot') {
      fullCylindersOnBoard += (loc.fullCylinders || 0);
    }
  }
  
  // For customer stops, add cylinders to deliver
  for (const loc of routeLocations) {
    if (loc.type === 'Customer' || loc.type === 'Distribution') {
      fullCylindersOnBoard += (loc.emptyCylinders || 0);
    }
  }
  
  // Initial weight
  let currentWeight = fullCylindersOnBoard * CYLINDER_WEIGHT_KG;
  
  // Add starting point
  weightProfile.push({
    location: "Starting load",
    weight: currentWeight,
    fullCylinders: fullCylindersOnBoard,
    emptyCylinders: emptyCylindersOnBoard
  });
  
  // Track route progression
  for (const loc of routeLocations) {
    if (loc.type === 'Customer' || loc.type === 'Distribution') {
      const fullsToDeliver = loc.emptyCylinders || 0;
      const actualFullsDelivered = Math.min(fullCylindersOnBoard, fullsToDeliver);
      
      fullCylindersOnBoard -= actualFullsDelivered;
      emptyCylindersOnBoard += (loc.emptyCylinders || 0);
      
      currentWeight = 
        (fullCylindersOnBoard * CYLINDER_WEIGHT_KG) + 
        (emptyCylindersOnBoard * EMPTY_CYLINDER_WEIGHT_KG);
      
      weightProfile.push({
        location: loc.name,
        weight: currentWeight,
        fullCylinders: fullCylindersOnBoard,
        emptyCylinders: emptyCylindersOnBoard
      });
    }
  }
  
  return weightProfile;
};

/**
 * Calculates if a route's total cylinder count would exceed the maximum allowed
 */
export const isRouteOverweight = (locations: LocationType[], startLocationId?: string | null, endLocationId?: string | null): boolean => {
  const totalWeight = calculateTotalWeight(locations, startLocationId, endLocationId);
  const maxWeight = MAX_CYLINDERS * CYLINDER_WEIGHT_KG;
  return totalWeight > maxWeight;
};

/**
 * Gets maximum allowed weight based on the cylinder limits
 */
export const getMaxWeight = (): number => {
  return MAX_CYLINDERS * CYLINDER_WEIGHT_KG;
};

/**
 * Gets maximum cylinders allowed
 */
export const getMaxCylinders = (): number => {
  return MAX_CYLINDERS;
};
