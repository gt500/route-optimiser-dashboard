
import { LocationType } from '@/components/locations/LocationEditDialog';

export interface OptimizationParams {
  prioritizeFuel: boolean;
  avoidTraffic: boolean;
  useRealTimeData: boolean;
  optimizeForDistance: boolean;
}

export interface VehicleConfigProps {
  baseConsumption: number; // L/100km
  fuelPrice: number; // R per liter
  maintenanceCostPerKm: number; // R per km
}

export const defaultVehicleConfig: VehicleConfigProps = {
  baseConsumption: 12,
  fuelPrice: 21.95,
  maintenanceCostPerKm: 0.50
};

export interface RouteState {
  distance: number;
  fuelConsumption: number;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
  cylinders: number;
  locations: LocationType[];
  availableLocations: LocationType[];
  trafficConditions: 'light' | 'moderate' | 'heavy';
  estimatedDuration: number;
  usingRealTimeData: boolean;
  country: string;
  region: string;
}

export const MAX_CYLINDERS = 80;
export const CYLINDER_WEIGHT_KG = 22;

export const routeOptimizationDefaultParams: OptimizationParams = {
  prioritizeFuel: true,
  avoidTraffic: true,
  useRealTimeData: true, // Set this to true by default for maximum efficiency
  optimizeForDistance: false
};
