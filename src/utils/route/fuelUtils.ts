
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
  // Base consumption plus adjustment for load weight
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
  const totalWeight = calculateTotalWeight(locations);
  return calculateFuelConsumption(distance, totalWeight);
};
