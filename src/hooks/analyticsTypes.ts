
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface AnalyticsData {
  deliveries: number;
  deliveriesChange: number;
  cylinders: number;
  cylindersChange: number;
  distance: number;
  fuelCost: number;
  fuelCostChange: number;
  routeLength: number;
  routeLengthChange: number;
  monthlyDeliveries: { name: string; value: number }[];
  fuelConsumption: { name: string; value: number }[];
  routeDistribution: { name: string; value: number }[];
  costBreakdown: { name: string; value: number }[];
  optimizationData?: { name: string; value: number }[];
  loadDistribution?: { name: string; value: number }[];
  optimizationPercentage?: number;
}

// Removed duplicate export line that was causing the error
