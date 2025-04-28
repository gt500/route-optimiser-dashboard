
import { LocationType } from '@/types/location';
import { CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight } from './weightUtils';

// Base fuel consumption rate in liters per 100km
const BASE_CONSUMPTION_RATE = 9.5;

// Additional consumption per 100kg of load (in liters per 100km)
const ADDITIONAL_CONSUMPTION_PER_100KG = 0.4;

// Factor for how much city driving impacts consumption
const CITY_CONSUMPTION_FACTOR = 1.2;

// Factor for highway driving
const HIGHWAY_CONSUMPTION_FACTOR = 0.9;

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
  // Handle edge cases with small distances
  if (distance <= 0) return 0;
  
  // Convert distance to 100km units
  const distanceIn100km = distance / 100;
  
  // Calculate weight-based consumption increase
  const weightFactor = totalWeight / 100 * ADDITIONAL_CONSUMPTION_PER_100KG;
  
  // Calculate base consumption rate
  let consumptionRate = BASE_CONSUMPTION_RATE + weightFactor;
  
  // Apply city driving factor if applicable
  if (isCityDriving) {
    consumptionRate *= CITY_CONSUMPTION_FACTOR;
  } else {
    consumptionRate *= HIGHWAY_CONSUMPTION_FACTOR;
  }
  
  // Calculate total consumption
  const totalConsumption = consumptionRate * distanceIn100km;
  
  return Math.max(0, totalConsumption);
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
  
  // Calculate total weight of all cylinders on the route
  const totalWeight = calculateTotalWeight(locations);
  
  // Calculate consumption based on weight and distance
  return calculateFuelConsumption(distance, totalWeight, isCityDriving);
};

/**
 * Calculate fuel consumption for a specific segment of the route
 * @param segmentDistance Distance of this segment in kilometers
 * @param locations Array of location objects in the route
 * @param currentIndex Index of the current location in the route
 * @param isCityDriving Whether the segment is primarily in city/urban areas
 * @returns Fuel consumption in liters for this segment
 */
export const calculateSegmentFuelConsumption = (
  segmentDistance: number,
  locations: LocationType[],
  currentIndex: number,
  isCityDriving: boolean = true
): number => {
  if (segmentDistance <= 0 || currentIndex <= 0 || !locations || locations.length <= currentIndex) {
    return 0;
  }
  
  // Calculate weight up to this point in the route
  const locationsUpToPoint = locations.slice(0, currentIndex + 1);
  const weightAtPoint = calculateTotalWeight(locationsUpToPoint);
  
  // Calculate consumption for this segment
  return calculateFuelConsumption(segmentDistance, weightAtPoint, isCityDriving);
};

/**
 * Calculate fuel cost for a given consumption and price per liter
 * @param consumption Fuel consumption in liters
 * @param pricePerLiter Price per liter in currency
 * @returns Fuel cost in currency
 */
export const calculateFuelCost = (
  consumption: number,
  pricePerLiter: number
): number => {
  if (consumption <= 0 || pricePerLiter <= 0) return 0;
  return consumption * pricePerLiter;
};
