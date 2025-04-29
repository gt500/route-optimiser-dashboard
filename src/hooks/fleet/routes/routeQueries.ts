
import { mockRoutes } from './mockRouteData';
import { RouteData, RouteStats, WeeklyData } from '../types/routeTypes';

/**
 * Fetch all routes
 */
export const fetchRoutes = async (): Promise<RouteData[]> => {
  // In a real app, this would fetch from an API
  return mockRoutes;
};

/**
 * Fetch active routes (scheduled or in-progress)
 */
export const fetchActiveRoutes = async (): Promise<RouteData[]> => {
  const data = await fetchRoutes();
  return data.filter(route => route.status === 'scheduled' || route.status === 'in_progress');
};

/**
 * Fetch completed or cancelled routes
 */
export const fetchRouteHistory = async (): Promise<RouteData[]> => {
  const data = await fetchRoutes();
  return data.filter(route => route.status === 'completed' || route.status === 'cancelled');
};

/**
 * Fetch routes by name
 */
export const fetchRouteDataByName = async (routeName: string): Promise<RouteData[]> => {
  const data = await fetchRoutes();
  const matchingRoutes = data.filter(route => route.name === routeName);
  return matchingRoutes;
};

/**
 * Get weekly delivery data for charts
 */
export const getWeeklyDeliveryData = async (): Promise<WeeklyData[]> => {
  const data = await fetchRoutes();
  
  // Group by day of week for weekly chart
  const weeklyData: WeeklyData[] = [
    { day: 'Mon', completed: 0, scheduled: 0 },
    { day: 'Tue', completed: 0, scheduled: 0 },
    { day: 'Wed', completed: 0, scheduled: 0 },
    { day: 'Thu', completed: 0, scheduled: 0 },
    { day: 'Fri', completed: 0, scheduled: 0 },
    { day: 'Sat', completed: 0, scheduled: 0 },
    { day: 'Sun', completed: 0, scheduled: 0 },
  ];
  
  // Simple simulation for chart data
  data.forEach((route, index) => {
    const dayIndex = index % 7;
    if (route.status === 'completed') {
      weeklyData[dayIndex].completed += 1;
    } else {
      weeklyData[dayIndex].scheduled += 1;
    }
  });
  
  return weeklyData;
};

/**
 * Get optimization statistics
 */
export const getOptimizationStats = async (routes: RouteData[]): Promise<RouteStats> => {
  // Return optimization stats for the dashboard
  return {
    totalRoutes: routes.length,
    optimizedRoutes: Math.floor(routes.length * 0.7),
    distanceSaved: 128.5,
    timeSaved: 214,
    fuelSaved: 18.6
  };
};
