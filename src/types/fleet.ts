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
  maxPayload?: number; // Added maxPayload property as optional
}

export interface MaintenanceItem {
  vehicle: string;
  type: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
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
