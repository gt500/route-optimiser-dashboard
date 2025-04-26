
import { LocationType } from '@/components/locations/LocationEditDialog';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';

/**
 * Calculate total payload weight for a truck considering both fulls (before delivery)
 * and empties (AFTER delivery at each site, empties are now on-board at 12kg each),
 * respecting the business rule.
 */
export const calculateTotalWeight = (locations: LocationType[]): number => {
  let totalWeight = 0;
  let runningFulls = 0;
  let runningEmpties = 0;
  
  locations.forEach(loc => {
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
  totalWeight = Math.max(runningFulls * CYLINDER_WEIGHT_KG, runningEmpties * EMPTY_CYLINDER_WEIGHT_KG);

  return totalWeight;
};
