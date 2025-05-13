
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
