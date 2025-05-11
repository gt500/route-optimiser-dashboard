import { mockRoutes } from './mockRouteData';
import { RouteData, RouteStats, WeeklyData } from '../types/routeTypes';

// Cache for route results
const routeCache = {
  allRoutes: null as RouteData[] | null,
  activeRoutes: null as RouteData[] | null,
  historyRoutes: null as RouteData[] | null,
  lastFetch: 0
};

// Cache lifetime in milliseconds (5 seconds)
const CACHE_LIFETIME = 5000;

/**
 * Fetch all routes with caching for better performance
 */
export const fetchRoutes = async (): Promise<RouteData[]> => {
  console.log("Fetching all routes from mockRoutes");
  
  const now = Date.now();
  const cacheExpired = now - routeCache.lastFetch > CACHE_LIFETIME;
  
  // Use cache if available and not expired
  if (routeCache.allRoutes && !cacheExpired) {
    console.log("Using cached routes data");
    return [...routeCache.allRoutes]; // Return a copy to prevent unintended mutations
  }
  
  // Reset cache to get fresh data
  routeCache.allRoutes = mockRoutes.map(route => ({
    ...route,
    vehicle_name: 'Leyland Ashok Phoenix'
  }));
  
  routeCache.lastFetch = now;
  
  console.log(`Retrieved ${routeCache.allRoutes.length} routes`);
  return [...routeCache.allRoutes]; // Return a copy
};

/**
 * Fetch active routes (scheduled or in-progress) with efficient caching
 */
export const fetchActiveRoutes = async (): Promise<RouteData[]> => {
  console.log("Fetching active routes");
  
  const now = Date.now();
  const cacheExpired = now - routeCache.lastFetch > CACHE_LIFETIME;
  
  if (routeCache.activeRoutes && !cacheExpired) {
    console.log("Using cached active routes data");
    return [...routeCache.activeRoutes]; // Return a copy
  }
  
  // Get all routes first (which handles its own caching)
  const allRoutes = await fetchRoutes();
  
  routeCache.activeRoutes = allRoutes.filter(route => 
    route.status === 'scheduled' || route.status === 'in_progress'
  ).map(route => ({
    ...route,
    vehicle_name: 'Leyland Ashok Phoenix' // Ensure vehicle name is always correct
  }));
  
  console.log(`Found ${routeCache.activeRoutes.length} active routes`);
  return [...routeCache.activeRoutes]; // Return a copy
};

/**
 * Fetch completed or cancelled routes with caching
 */
export const fetchRouteHistory = async (): Promise<RouteData[]> => {
  console.log("Fetching route history");
  
  const now = Date.now();
  const cacheExpired = now - routeCache.lastFetch > CACHE_LIFETIME;
  
  if (routeCache.historyRoutes && !cacheExpired) {
    console.log("Using cached history routes data");
    return [...routeCache.historyRoutes]; // Return a copy
  }
  
  // Get all routes first (with caching)
  const allRoutes = await fetchRoutes();
  
  routeCache.historyRoutes = allRoutes.filter(route => 
    route.status === 'completed' || route.status === 'cancelled'
  ).map(route => ({
    ...route,
    vehicle_name: 'Leyland Ashok Phoenix' // Ensure vehicle name is always correct
  }));
  
  console.log(`Found ${routeCache.historyRoutes.length} history routes`);
  return [...routeCache.historyRoutes]; // Return a copy
};

/**
 * Update a route's status in our mock database with improved cache invalidation
 */
export const updateRouteStatus = async (routeId: string, status: string): Promise<boolean> => {
  console.log(`Updating route ${routeId} status to ${status}`);
  
  // Find the route in our mockRoutes
  const routeIndex = mockRoutes.findIndex(route => route.id === routeId);
  
  if (routeIndex >= 0) {
    // Update the route status
    mockRoutes[routeIndex] = {
      ...mockRoutes[routeIndex],
      status: status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      vehicle_name: 'Leyland Ashok Phoenix' // Ensure vehicle name is always correct
    };
    
    // Invalidate cache to force fresh data on next fetch
    routeCache.lastFetch = 0;
    routeCache.allRoutes = null;
    routeCache.activeRoutes = null;
    routeCache.historyRoutes = null;
    
    console.log(`Route ${routeId} updated to status: ${status}`);
    return true;
  }
  
  console.error(`Could not find route with ID: ${routeId}`);
  return false;
};

/**
 * Fetch routes by name
 */
export const fetchRouteDataByName = async (routeName: string): Promise<RouteData[]> => {
  const data = await fetchRoutes();
  const matchingRoutes = data.filter(route => route.name === routeName)
    .map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix' // Ensure vehicle name is always correct
    }));
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
