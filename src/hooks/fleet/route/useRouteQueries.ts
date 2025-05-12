import { useCallback } from 'react';
import { toast } from 'sonner';
import type { RouteData } from '../types/routeTypes';
import {
  fetchRoutes as fetchRoutesQuery,
  fetchActiveRoutes as fetchActiveRoutesQuery,
  fetchRouteHistory as fetchRouteHistoryQuery,
  fetchRouteDataByName as fetchRouteDataByNameQuery,
  getWeeklyDeliveryData as getWeeklyDeliveryDataQuery,
  getOptimizationStats as getOptimizationStatsQuery
} from '../routes/routeQueries';

/**
 * Hook containing query methods for route data
 */
export const useRouteQueries = (routes: RouteData[]) => {
  // Main fetch function with optimized caching
  const fetchRoutes = useCallback(async () => {
    console.log("Fetching all routes in useRouteData hook");
    
    try {
      const freshRoutes = await fetchRoutesQuery();
      
      // Set the routes with the correct vehicle name
      const routesWithCorrectVehicles = freshRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
      
      return routesWithCorrectVehicles;
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to load routes");
      return [];
    }
  }, []);
  
  const fetchRouteData = useCallback(async () => {
    console.log("Fetching route data in useRouteData hook");
    try {
      const routesData = await fetchRoutesQuery();
      return routesData.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
    } catch (error) {
      console.error("Error fetching route data:", error);
      return [];
    }
  }, []);
  
  // Optimized to force fresh data fetch for active routes
  const fetchActiveRoutes = useCallback(async () => {
    console.log("Fetching active routes in useRouteData hook");
    try {
      // Always fetch from API for active routes to ensure fresh data
      const freshRoutes = await fetchActiveRoutesQuery();
      
      console.log('Fetched active routes:', freshRoutes);
      
      return freshRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
    } catch (error) {
      console.error("Error fetching active routes:", error);
      return [];
    }
  }, []);
  
  const fetchRouteHistory = useCallback(async () => {
    console.log("Fetching route history in useRouteData hook");
    try {
      // If we already have routes loaded, filter them in memory
      if (routes.length > 0) {
        return routes.filter(route => 
          route.status === 'completed' || route.status === 'cancelled'
        );
      }
      
      const historyRoutes = await fetchRouteHistoryQuery();
      return historyRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
    } catch (error) {
      console.error("Error fetching route history:", error);
      return [];
    }
  }, [routes]);
  
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    console.log(`Fetching route data for ${routeName} in useRouteData hook`);
    const routeData = await fetchRouteDataByNameQuery(routeName);
    return routeData.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const getWeeklyDeliveryData = useCallback(async () => {
    console.log("Getting weekly delivery data in useRouteData hook");
    return await getWeeklyDeliveryDataQuery();
  }, []);
  
  const getOptimizationStats = useCallback(async () => {
    console.log("Getting optimization stats in useRouteData hook");
    return await getOptimizationStatsQuery(routes);
  }, [routes.length]);

  return {
    fetchRoutes,
    fetchRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    fetchRouteDataByName,
    getWeeklyDeliveryData,
    getOptimizationStats
  };
};
