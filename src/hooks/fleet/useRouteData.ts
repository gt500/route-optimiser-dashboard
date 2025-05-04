import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { RouteData } from './types/routeTypes';
import { mockRoutes } from './routes/mockRouteData';
import { 
  fetchRoutes as fetchRoutesQuery,
  fetchActiveRoutes as fetchActiveRoutesQuery,
  fetchRouteHistory as fetchRouteHistoryQuery,
  fetchRouteDataByName as fetchRouteDataByNameQuery,
  getWeeklyDeliveryData as getWeeklyDeliveryDataQuery,
  getOptimizationStats as getOptimizationStatsQuery
} from './routes/routeQueries';
import { 
  startRoute as startRouteAction,
  completeRoute as completeRouteAction
} from './routes/routeUpdates';

// Use proper type-only re-export with 'export type'
export type { RouteData } from './types/routeTypes';

export const useRouteData = () => {
  const [routes, setRoutes] = useState<RouteData[]>(
    // Ensure correct vehicle names on initialization
    mockRoutes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }))
  );
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});

  const fetchRoutes = useCallback(async () => {
    console.log("Fetching all routes in useRouteData hook");
    const freshRoutes = await fetchRoutesQuery();
    
    // Ensure correct vehicle names
    const routesWithCorrectVehicleName = freshRoutes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
    
    setRoutes(routesWithCorrectVehicleName);
    return routesWithCorrectVehicleName;
  }, []);
  
  const fetchRouteData = useCallback(async () => {
    console.log("Fetching route data in useRouteData hook");
    const routes = await fetchRoutesQuery();
    
    // Ensure correct vehicle names
    return routes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchActiveRoutes = useCallback(async () => {
    console.log("Fetching active routes in useRouteData hook");
    const activeRoutes = await fetchActiveRoutesQuery();
    
    // Ensure correct vehicle names
    return activeRoutes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchRouteHistory = useCallback(async () => {
    console.log("Fetching route history in useRouteData hook");
    const historyRoutes = await fetchRouteHistoryQuery();
    
    // Ensure correct vehicle names
    return historyRoutes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    console.log(`Fetching route data for ${routeName} in useRouteData hook`);
    return await fetchRouteDataByNameQuery(routeName);
  }, []);
  
  const getWeeklyDeliveryData = useCallback(async () => {
    console.log("Getting weekly delivery data in useRouteData hook");
    return await getWeeklyDeliveryDataQuery();
  }, []);
  
  const getOptimizationStats = useCallback(async () => {
    console.log("Getting optimization stats in useRouteData hook");
    return await getOptimizationStatsQuery(routes);
  }, [routes.length]);

  const startRoute = useCallback(async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in useRouteData hook`);
    try {
      const result = await startRouteAction(routeId, routes, setRoutes, setProcessingRoutes);
      if (result) {
        // Refresh the routes data after a successful update
        await fetchRoutes();
      }
      return result;
    } catch (error) {
      console.error("Error starting route:", error);
      toast.error("Failed to start route");
      return false;
    }
  }, [routes, fetchRoutes]);

  const completeRoute = useCallback(async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in useRouteData hook`);
    try {
      const result = await completeRouteAction(routeId, routes, setRoutes, setProcessingRoutes);
      if (result) {
        // Refresh the routes data after a successful update
        await fetchRoutes();
      }
      return result;
    } catch (error) {
      console.error("Error completing route:", error);
      toast.error("Failed to complete route");
      return false;
    }
  }, [routes, fetchRoutes]);

  return {
    routes,
    processingRoutes,
    fetchRoutes,
    startRoute,
    completeRoute,
    fetchRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    fetchRouteDataByName,
    getWeeklyDeliveryData,
    getOptimizationStats
  };
};
