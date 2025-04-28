
import { LocationType } from '@/types/location';

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
  waypointData: { distance: number; duration: number }[];
}

export interface OptimizationParams {
  prioritizeFuel: boolean;
  avoidTraffic: boolean;
  useRealTimeData: boolean;
  optimizeForDistance: boolean;
}

export interface VehicleConfigProps {
  maxWeight: number;
  fuelPrice: number;
  maintenanceCost: number;
  baseConsumption: number;
  maxCylinders: number;
  cylinderWeight: number;
  emptyCylinderWeight: number;
}

export const MAX_CYLINDERS = 80;
export const CYLINDER_WEIGHT_KG = 22;
export const EMPTY_CYLINDER_WEIGHT_KG = 12;

export const defaultVehicleConfig: VehicleConfigProps = {
  maxWeight: 3500,
  fuelPrice: 21.95,
  maintenanceCost: 0.85,
  baseConsumption: 9.5,
  maxCylinders: MAX_CYLINDERS,
  cylinderWeight: CYLINDER_WEIGHT_KG,
  emptyCylinderWeight: EMPTY_CYLINDER_WEIGHT_KG
};

export const routeOptimizationDefaultParams: OptimizationParams = {
  prioritizeFuel: true,
  avoidTraffic: true,
  useRealTimeData: true,
  optimizeForDistance: true
};
