
export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  status: 'Available' | 'On Route' | 'Maintenance';
  capacity: number;
  load: number;
  fuelLevel: number;
  location: string;
  lastService: string;
  country: string;
  region: string;
  maxPayload?: number;
  odometer?: number;
  lastServiceKm?: number;
}

export interface MaintenanceItem {
  vehicle: string;
  vehicleId: string;
  type: string;
  category: 'Monthly' | 'Quarterly' | 'Distance';
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  cost: number;
  notes?: string;
  triggerPoint?: string;
}

export interface PerformanceMetric {
  value: number;
  target: number;
  unit: string;
}

export interface FleetPerformanceMetrics {
  fuelEfficiency: PerformanceMetric;
  fleetUtilization: PerformanceMetric;
  maintenanceCompliance: PerformanceMetric;
  onTimeDeliveries: PerformanceMetric;
}

export interface MaintenanceTask {
  task: string;
  frequency: string;
  cost: number;
  notes?: string;
  triggerPoint?: string;
  category: 'Monthly' | 'Quarterly' | 'Distance';
}

export interface FixedCost {
  type: string;
  description: string;
  cost: number;
}

export interface MaintenanceBudget {
  category: string;
  monthlyCost: number;
  annualCost: number;
}

export interface MaintenanceTimeline {
  month: number;
  tasks: string[];
  estimatedCost: number;
}
