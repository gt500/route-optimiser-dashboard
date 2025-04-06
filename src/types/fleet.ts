
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
}

export interface MaintenanceItem {
  vehicle: string;
  type: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}
