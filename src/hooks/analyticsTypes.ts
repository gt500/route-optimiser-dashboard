
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

// We re-export these types so they are accessible across the application
export type { AnalyticsData, TimePeriod };
