
import { LocationType } from '@/types/location';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG, MAX_CYLINDERS } from '@/hooks/routes/types';

/**
 * Calculate total payload weight for a truck considering both full cylinders 
 * at the beginning of the route and empties collected during deliveries.
 * 
 * The truck starts with full cylinders and gradually exchanges them for empty ones,
 * so we need to calculate the weight at each point of the journey to find the maximum.
 */
export const calculateTotalWeight = (locations: LocationType[]): number => {
  // If no locations, return 0 weight
  if (!locations || locations.length === 0) {
    return 0;
  }
  
  // Initialize with zero cylinders - we'll load at depots and unload at customers
  let fullCylindersOnBoard = 0;
  let emptyCylindersOnBoard = 0;
  let maxWeight = 0;
  
  // Track if this is a start depot or end depot
  const isStartDepot = (index: number) => index === 0;
  const isEndDepot = (index: number) => index === locations.length - 1;
  
  // Process each location in sequence
  locations.forEach((loc, index) => {
    // At depots/storage, we load full cylinders (but don't count weight at starting point)
    if (loc.type === 'Storage' || loc.type === 'Depot') {
      if (loc.fullCylinders && !isStartDepot(index)) {
        fullCylindersOnBoard += loc.fullCylinders;
      }
    }
    
    // At customer locations, we deliver full cylinders and collect empties
    else if (loc.type === 'Customer' || loc.type === 'Distribution') {
      // The number of cylinders being delivered at this stop
      const fullsToDeliver = loc.fullCylinders || 0;
      
      // Can't deliver more than what's on board
      const actualFullsDelivered = Math.min(fullCylindersOnBoard, fullsToDeliver);
      
      // Adjust on-board counts
      fullCylindersOnBoard -= actualFullsDelivered;
      
      // Collect empty cylinders
      const emptiesToCollect = loc.emptyCylinders || 0;
      emptyCylindersOnBoard += emptiesToCollect;
    }
    
    // Calculate current weight after this stop (don't count weight at end point)
    if (!isEndDepot(index)) {
      const currentWeight = 
        (fullCylindersOnBoard * CYLINDER_WEIGHT_KG) + 
        (emptyCylindersOnBoard * EMPTY_CYLINDER_WEIGHT_KG);
        
      console.log(`Stop at ${loc.name}: Carrying ${fullCylindersOnBoard} fulls, ${emptyCylindersOnBoard} empties. Current weight: ${currentWeight}kg`);
      
      // Update max weight if this is higher
      maxWeight = Math.max(maxWeight, currentWeight);
    }
  });
  
  console.log(`Maximum weight during route: ${maxWeight}kg`);
  return maxWeight;
};

/**
 * Calculates if a route's total cylinder count would exceed the maximum allowed
 */
export const isRouteOverweight = (locations: LocationType[]): boolean => {
  const totalWeight = calculateTotalWeight(locations);
  return totalWeight > (MAX_CYLINDERS * CYLINDER_WEIGHT_KG);
};

/**
 * Gets maximum cylinders allowed based on the weight limit
 */
export const getMaxCylinders = (): number => {
  return MAX_CYLINDERS;
};
