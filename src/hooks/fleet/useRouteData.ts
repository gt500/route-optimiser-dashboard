
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
  getOptimizationStats as getOptimizationStatsQuery,
  updateRouteStatus
} from './routes/routeQueries';

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
    
    // Set the routes with the correct vehicle name
    const routesWithCorrectVehicles = freshRoutes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
    
    setRoutes(routesWithCorrectVehicles);
    return routesWithCorrectVehicles;
  }, []);
  
  const fetchRouteData = useCallback(async () => {
    console.log("Fetching route data in useRouteData hook");
    const routes = await fetchRoutesQuery();
    return routes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchActiveRoutes = useCallback(async () => {
    console.log("Fetching active routes in useRouteData hook");
    const routes = await fetchActiveRoutesQuery();
    return routes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchRouteHistory = useCallback(async () => {
    console.log("Fetching route history in useRouteData hook");
    const routes = await fetchRouteHistoryQuery();
    return routes.map(route => ({
      ...route,
      vehicle_name: 'Leyland Ashok Phoenix'
    }));
  }, []);
  
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    console.log(`Fetching route data for ${routeName} in useRouteData hook`);
    const routes = await fetchRouteDataByNameQuery(routeName);
    return routes.map(route => ({
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

  const startRoute = useCallback(async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in useRouteData hook`);
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update the route status directly via the API function
      const success = await updateRouteStatus(routeId, 'in_progress');
      
      if (!success) {
        throw new Error('Failed to update route status');
      }
      
      // Update local state to reflect the change
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, status: 'in_progress', vehicle_name: 'Leyland Ashok Phoenix' } 
            : route
        )
      );
      
      toast.success("Route started successfully");
      
      // Refresh routes to ensure we have the latest data
      await fetchRoutes();
      
      return true;
    } catch (error) {
      console.error("Error starting route:", error);
      toast.error("Failed to start route");
      return false;
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  }, [fetchRoutes]);

  const completeRoute = useCallback(async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in useRouteData hook`);
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the route status directly via the API function
      const success = await updateRouteStatus(routeId, 'completed');
      
      if (!success) {
        throw new Error('Failed to update route status');
      }
      
      // Update local state to reflect the change
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, status: 'completed', vehicle_name: 'Leyland Ashok Phoenix' } 
            : route
        )
      );
      
      toast.success("Route marked as completed");
      
      // Refresh routes to ensure we have the latest data
      await fetchRoutes();
      
      return true;
    } catch (error) {
      console.error("Error completing route:", error);
      toast.error("Failed to complete route");
      return false;
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  }, [fetchRoutes]);

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
