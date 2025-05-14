
// Re-export the types from the parent directory
export type { RouteData, RouteStats, WeeklyData } from '../types/routeTypes';

// Add additional type exports for better type safety
export interface RouteParams {
  id?: string;
  name?: string;
  status?: string;
}
