import { LocationType } from '@/components/locations/LocationEditDialog';

// --- Constants updated: Full = 9kg, Empty = 12kg, Max 80 cylinders ---
export const CYLINDER_WEIGHT_KG = 9;
export const EMPTY_CYLINDER_WEIGHT_KG = 12;
export const MAX_CYLINDERS = 80;
export const FULL_LOAD_PER_SITE = 20;

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
  waypointData?: { distance: number, duration: number }[];
}

export interface VehicleConfigProps {
  fuelPrice: number;
  baseConsumption: number;
  maintenanceCostPerKm: number;
}

export const defaultVehicleConfig: VehicleConfigProps = {
  fuelPrice: 21.95,
  baseConsumption: 0.25, // L/km
  maintenanceCostPerKm: 1.2 // Rand per km
};

export interface OptimizationParams {
  prioritizeFuel: boolean;
  avoidTraffic: boolean;
  useRealTimeData: boolean;
  optimizeForDistance: boolean;
}

export const routeOptimizationDefaultParams: OptimizationParams = {
  prioritizeFuel: true,
  avoidTraffic: true,
  useRealTimeData: true,
  optimizeForDistance: true
};
