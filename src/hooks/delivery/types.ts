
export interface DeliveryData {
  id: string;
  siteName: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  date: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  country?: string;
}

export interface RouteDelivery {
  id: string;
  locationName: string;
  cylinders: number;
  sequence: number;
  latitude?: number;
  longitude?: number;
  region?: string;
  country?: string;
}

export interface ProcessedRoute {
  routeId: string;
  routeName: string;
  date: string;
  totalDistance: number;
  totalDuration: number;
  estimatedCost: number;
  deliveries: RouteDelivery[];
  totalCylinders: number;
}

export interface DeliveryHookReturn {
  deliveries: DeliveryData[];
  isLoading: boolean;
  fetchDeliveryData: () => Promise<void>;
}

// Load type constants
export const FULL_LOAD_PER_SITE = 20; // Number of cylinders that constitute a full load per site
export const FULL_TRUCK_LOAD = 80;    // Total cylinders capacity for a full truck
