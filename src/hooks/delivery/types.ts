
export interface DeliveryData {
  id: string;
  siteName: string;
  date: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  status: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  country?: string;
  actualDistance?: number;
  actualDuration?: number;
  traffic?: string;
}

export interface RouteDelivery {
  id: string;
  locationName: string;
  cylinders: number;
  sequence?: number;
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

// Constants
export const FULL_LOAD_PER_SITE = 20;
