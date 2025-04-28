
import { LocationType } from '@/types/location';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight } from './weightUtils';

// Base fuel consumption rate in liters per 100km
const BASE_CONSUMPTION_RATE = 9.5;

// Additional consumption per 100kg of load (in liters per 100km)
const ADDITIONAL_CONSUMPTION_PER_100KG = 0.4;

// Factor for how much city driving impacts consumption
const CITY_CONSUMPTION_FACTOR = 1.2;

/**
 * Calculate fuel consumption based on distance and vehicle load
 * @param distance Distance in kilometers
 * @param totalWeight Total weight in kilograms
 * @param isCityDriving Whether the route is primarily in city/urban areas
 * @returns Fuel consumption in liters
 */
export const calculateFuelConsumption = (
  distance: number,
  totalWeight: number,
  isCityDriving: boolean = true
): number => {
  // Convert distance to 100km units
  const distanceIn100km = distance / 100;
  
  // Calculate weight-based consumption increase
  const weightFactor = totalWeight / 100 * ADDITIONAL_CONSUMPTION_PER_100KG;
  
  // Calculate base consumption rate
  let consumptionRate = BASE_CONSUMPTION_RATE + weightFactor;
  
  // Apply city driving factor if applicable
  if (isCityDriving) {
    consumptionRate *= CITY_CONSUMPTION_FACTOR;
  }
  
  // Calculate total consumption
  const totalConsumption = consumptionRate * distanceIn100km;
  
  return totalConsumption;
};

/**
 * Calculate fuel consumption for an entire route
 * @param distance Total route distance in kilometers
 * @param locations Array of location objects in the route
 * @param isCityDriving Whether the route is primarily in city/urban areas
 * @returns Fuel consumption in liters
 */
export const calculateRouteFuelConsumption = (
  distance: number,
  locations: LocationType[],
  isCityDriving: boolean = true
): number => {
  if (distance <= 0 || !locations || locations.length === 0) {
    return 0;
  }
  
  // Calculate total weight from all cylinders on the route
  const totalWeight = calculateTotalWeight(locations);
  
  // Calculate consumption based on weight and distance
  return calculateFuelConsumption(distance, totalWeight, isCityDriving);
};
