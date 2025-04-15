
// Update this file to add the waypointData field to the RouteState interface

import { LocationType } from '@/components/locations/LocationEditDialog';

export const CYLINDER_WEIGHT_KG = 22;
export const MAX_CYLINDERS = 50;
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
}

export const defaultVehicleConfig: VehicleConfigProps = {
  fuelPrice: 21.95
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
