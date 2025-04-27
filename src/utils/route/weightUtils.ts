
import { LocationType } from '@/types/location';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';

/**
 * Calculate total payload weight for a truck considering both full cylinders 
 * at the beginning of the route and empties collected during deliveries.
 * 
 * The truck starts with full cylinders and gradually collects empty ones,
 * so we need to calculate the maximum weight at any point of the journey.
 */
export const calculateTotalWeight = (locations: LocationType[]): number => {
  // Initial count - starting with fulls from depot/storage
  let fullCylindersOnBoard = 0;
  let emptyCylindersOnBoard = 0;
  let maxWeight = 0;
  
  // First add all full cylinders from storage/depot locations
  locations.forEach(loc => {
    if (loc.type === 'Storage' || loc.type === 'Depot') {
      if (loc.fullCylinders) {
        fullCylindersOnBoard += loc.fullCylinders;
      }
    }
  });
  
  // Calculate initial weight with all full cylinders
  maxWeight = fullCylindersOnBoard * CYLINDER_WEIGHT_KG;
  
  // Now simulate the route
  for (const loc of locations) {
    // For customer locations, we deliver fulls and collect empties
    if (loc.type === 'Customer' || loc.type === 'Distribution') {
      // Deliver full cylinders (reduce count on board)
      if (loc.fullCylinders) {
        fullCylindersOnBoard -= Math.min(fullCylindersOnBoard, loc.fullCylinders);
      }
      
      // Collect empty cylinders (increase count on board)
      if (loc.emptyCylinders) {
        emptyCylindersOnBoard += loc.emptyCylinders;
      }
      
      // Calculate current weight after this stop
      const currentWeight = 
        (fullCylindersOnBoard * CYLINDER_WEIGHT_KG) + 
        (emptyCylindersOnBoard * EMPTY_CYLINDER_WEIGHT_KG);
        
      // Update max weight if this is higher
      maxWeight = Math.max(maxWeight, currentWeight);
    }
  }
  
  return maxWeight;
};
