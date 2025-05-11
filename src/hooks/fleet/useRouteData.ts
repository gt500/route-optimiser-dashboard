
import { useState, useCallback, useEffect } from 'react';
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
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Load routes on first mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  // Auto-refresh mechanism
  useEffect(() => {
    // Check if we're processing any routes - if so, refresh more frequently
    const isProcessing = Object.keys(processingRoutes).length > 0;
    const refreshInterval = isProcessing ? 3000 : 20000; // 3s if processing, 20s otherwise
    
    const timer = setTimeout(() => {
      fetchRoutes().then(() => {
        setLastRefresh(Date.now());
      });
    }, refreshInterval);
    
    return () => clearTimeout(timer);
  }, [lastRefresh, processingRoutes]);

  // Main fetch function with optimized caching
  const fetchRoutes = useCallback(async () => {
    console.log("Fetching all routes in useRouteData hook");
    setIsLoading(true);
    
    try {
      const freshRoutes = await fetchRoutesQuery();
      
      // Set the routes with the correct vehicle name
      const routesWithCorrectVehicles = freshRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
      
      setRoutes(routesWithCorrectVehicles);
      return routesWithCorrectVehicles;
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to load routes");
      return [];
    } finally {
      setIsLoading(false);
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
  
  // Optimized to use cached data when possible
  const fetchActiveRoutes = useCallback(async () => {
    console.log("Fetching active routes in useRouteData hook");
    try {
      // If we already have routes loaded, filter them in memory
      if (routes.length > 0) {
        const activeRoutes = routes.filter(route => 
          route.status === 'scheduled' || route.status === 'in_progress'
        );
        console.log('Using cached active routes:', activeRoutes.length);
        return activeRoutes;
      }
      
      // Otherwise fetch from API
      const freshRoutes = await fetchActiveRoutesQuery();
      return freshRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
    } catch (error) {
      console.error("Error fetching active routes:", error);
      return [];
    }
  }, [routes]);
  
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
  
  // Other query methods (unchanged)
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

  // Optimized route status update
  const startRoute = useCallback(async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in useRouteData hook`);
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      // Update the route status directly via the API function
      const success = await updateRouteStatus(routeId, 'in_progress');
      
      if (!success) {
        throw new Error('Failed to update route status');
      }
      
      // Update local state to reflect the change immediately
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

  // Optimized route completion
  const completeRoute = useCallback(async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in useRouteData hook`);
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Update the route status
      const success = await updateRouteStatus(routeId, 'completed');
      
      if (!success) {
        throw new Error('Failed to update route status');
      }
      
      // Update local state immediately
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

  // Return all hooks and state
  return {
    routes,
    isLoading,
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
