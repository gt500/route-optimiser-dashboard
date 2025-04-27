
import { LocationType } from '@/types/location';
import { calculateTotalWeight } from './weightUtils';

// Constants for accurate fuel consumption calculation
const BASE_FUEL_CONSUMPTION = 12; // 12L/100km for an average delivery truck
const LOAD_FACTOR = 0.02; // 2% increase in consumption per 100kg of load

/**
 * Calculate fuel consumption based on distance, vehicle type, and load
 * This takes into account the variable weight during the journey
 */
export const calculateFuelConsumption = (distance: number, totalWeight: number): number => {
  // If invalid values provided, return 0
  if (!distance || distance <= 0 || isNaN(distance)) {
    return 0;
  }
  
  // Base consumption plus adjustment for load weight
  // If there's no weight or invalid weight, just use base consumption
  if (!totalWeight || totalWeight <= 0 || isNaN(totalWeight)) {
    return (distance * BASE_FUEL_CONSUMPTION) / 100;
  }
  
  const weightFactor = 1 + (totalWeight / 100) * LOAD_FACTOR;
  return (distance * BASE_FUEL_CONSUMPTION * weightFactor) / 100;
};

/**
 * Calculate fuel consumption for a route considering changing weight
 * during the journey as cylinders are exchanged
 */
export const calculateRouteFuelConsumption = (
  distance: number, 
  locations: LocationType[]
): number => {
  // If we don't have valid inputs, return 0
  if (!distance || distance <= 0 || !locations || locations.length === 0) {
    return 0;
  }
  
  const totalWeight = calculateTotalWeight(locations);
  return calculateFuelConsumption(distance, totalWeight);
};
