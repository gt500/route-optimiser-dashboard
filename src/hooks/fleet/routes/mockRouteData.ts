
import { RouteData } from '../types/routeTypes';

// Mock data for routes - ensure each route has unique, realistic values
export const mockRoutes: RouteData[] = [
  {
    id: '1',
    name: 'Cape Town Urban Delivery',
    date: '2025-04-28',
    status: 'in_progress',
    vehicle_id: 'TRK-001',
    vehicle_name: 'Heavy Duty Truck',
    stops: [
      { id: 's1', location_name: 'Afrox Epping Depot', sequence: 1, distance: 0, duration: 0 },
      { id: 's2', location_name: 'Pick n Pay TableView', sequence: 2, distance: 18.5, duration: 26, cylinders: 18 },
      { id: 's3', location_name: 'SUPERSPAR Parklands', sequence: 3, distance: 4.2, duration: 12, cylinders: 12 },
      { id: 's4', location_name: 'West Coast Village', sequence: 4, distance: 3.8, duration: 10, cylinders: 16 },
    ],
    total_distance: 26.5,
    total_duration: 48,
    total_cylinders: 46,
    estimated_cost: 295.80
  },
  {
    id: '2',
    name: 'Northern Suburbs Route',
    date: '2025-04-29',
    status: 'scheduled',
    vehicle_id: 'TRK-002',
    vehicle_name: 'Medium Capacity Truck',
    stops: [
      { id: 's5', location_name: 'Shell Hugo Street', sequence: 1, distance: 0, duration: 0 },
      { id: 's6', location_name: 'SUPERSPAR Plattekloof', sequence: 2, distance: 12.7, duration: 19, cylinders: 14 },
      { id: 's7', location_name: 'Willowridge Shopping Centre', sequence: 3, distance: 7.8, duration: 15, cylinders: 17 },
      { id: 's8', location_name: 'Zevenwacht', sequence: 4, distance: 9.3, duration: 17, cylinders: 21 },
    ],
    total_distance: 29.8,
    total_duration: 51,
    total_cylinders: 52,
    estimated_cost: 332.95
  },
  {
    id: '3',
    name: 'Winelands Delivery',
    date: '2025-04-30',
    status: 'scheduled',
    vehicle_id: 'TRK-001',
    vehicle_name: 'Heavy Duty Truck',
    stops: [
      { id: 's9', location_name: 'Shell Stellenbosch Square', sequence: 1, distance: 0, duration: 0 },
      { id: 's10', location_name: 'KWIKSPAR Paarl', sequence: 2, distance: 25.6, duration: 34, cylinders: 10 },
      { id: 's11', location_name: 'Laborie', sequence: 3, distance: 8.4, duration: 16, cylinders: 13 },
      { id: 's12', location_name: 'Simonsrust Shopping Centre', sequence: 4, distance: 22.1, duration: 28, cylinders: 19 },
    ],
    total_distance: 56.1,
    total_duration: 78,
    total_cylinders: 42,
    estimated_cost: 625.35
  }
];
