
import { useCallback } from 'react';
import type { RouteData } from '../types/routeTypes';
import {
  fetchRoutes as fetchRoutesQuery,
  fetchActiveRoutes as fetchActiveRoutesQuery,
  fetchRouteHistory as fetchRouteHistoryQuery,
  fetchRouteDataByName as fetchRouteDataByNameQuery,
  getWeeklyDeliveryData as getWeeklyDeliveryDataQuery,
  getOptimizationStats as getOptimizationStatsQuery
} from '../routes/routeQueries';
import { handleSupabaseError } from '@/utils/supabaseUtils';

// Cache for active routes
let activeRoutesCache: RouteData[] = [];
let lastActiveFetchTime = 0;
const CACHE_TTL = 10000; // 10 seconds TTL for the cache

/**
 * Hook containing query methods for route data with improved caching
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
      handleSupabaseError(error, "Error fetching routes");
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
      handleSupabaseError(error, "Error fetching route data");
      return [];
    }
  }, []);
  
  // Optimized to use cache for active routes
  const fetchActiveRoutes = useCallback(async () => {
    const now = Date.now();
    
    // Use cache if it's still fresh enough
    if (activeRoutesCache.length > 0 && (now - lastActiveFetchTime < CACHE_TTL)) {
      console.log("Using cached active routes data");
      return activeRoutesCache;
    }
    
    console.log("Fetching active routes in useRouteData hook (cache expired or empty)");
    try {
      // Fetch from API with fresh data
      const freshRoutes = await fetchActiveRoutesQuery();
      
      console.log('Fetched active routes:', freshRoutes);
      
      // Update cache
      const processedRoutes = freshRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
      
      activeRoutesCache = processedRoutes;
      lastActiveFetchTime = now;
      
      return processedRoutes;
    } catch (error) {
      handleSupabaseError(error, "Error fetching active routes");
      
      // Return cache even if expired on error
      if (activeRoutesCache.length > 0) {
        console.log("Returning stale cache after fetch error");
        return activeRoutesCache;
      }
      
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
      handleSupabaseError(error, "Error fetching route history");
      return [];
    }
  }, [routes]);
  
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    if (!routeName || typeof routeName !== 'string') {
      console.error('Invalid route name provided');
      return [];
    }
    
    console.log(`Fetching route data for ${routeName} in useRouteData hook`);
    try {
      const routeData = await fetchRouteDataByNameQuery(routeName);
      return routeData.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
    } catch (error) {
      handleSupabaseError(error, `Error fetching route data for ${routeName}`);
      return [];
    }
  }, []);
  
  const getWeeklyDeliveryData = useCallback(async () => {
    console.log("Getting weekly delivery data in useRouteData hook");
    try {
      return await getWeeklyDeliveryDataQuery();
    } catch (error) {
      handleSupabaseError(error, "Error fetching weekly delivery data");
      return [];
    }
  }, []);
  
  const getOptimizationStats = useCallback(async () => {
    console.log("Getting optimization stats in useRouteData hook");
    try {
      return await getOptimizationStatsQuery(routes);
    } catch (error) {
      handleSupabaseError(error, "Error fetching optimization stats");
      return {
        fuelSaved: 0,
        distanceSaved: 0,
        timeSaved: 0,
        costSaved: 0
      };
    }
  }, [routes.length, routes]);

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
