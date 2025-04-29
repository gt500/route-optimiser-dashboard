
// Define the RouteData type
export interface RouteData {
  id: string;
  name: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  vehicle_id?: string;
  vehicle_name?: string;
  stops?: {
    id: string;
    location_name: string;
    sequence: number;
    distance?: number;
    duration?: number;
    cylinders?: number;
    fuel_cost?: number;
  }[];
  total_distance?: number;
  total_duration?: number;
  total_cylinders?: number;
  estimated_cost?: number;
}

export interface RouteStats {
  totalRoutes: number;
  optimizedRoutes: number;
  distanceSaved: number;
  timeSaved: number;
  fuelSaved: number;
}

export interface WeeklyData {
  day: string;
  completed: number;
  scheduled: number;
}

// Add this interface for TileLayer props
export interface TileLayerProps {
  url: string;
  attribution: string;
  [key: string]: any; // Add catch-all for other properties
}
