
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouteQueries } from './route/useRouteQueries';
import { useRouteActions } from './route/useRouteActions';
import { useRouteRefresh } from './route/useRouteRefresh';
import type { RouteData } from './types/routeTypes';

// Use proper type-only re-export with 'export type'
export type { RouteData } from './types/routeTypes';

export const useRouteData = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Add ref to track initial mount and prevent duplicate fetches
  const initialFetchDone = useRef(false);

  // Get query methods from the query hook
  const queries = useRouteQueries(routes);
  
  // Wrapper for fetchRoutes that updates state
  const fetchRoutes = useCallback(async () => {
    // Prevent duplicate fetches while already loading
    if (isLoading) return [];
    
    setIsLoading(true);
    try {
      const fetchedRoutes = await queries.fetchRoutes();
      setRoutes(fetchedRoutes);
      return fetchedRoutes;
    } catch (error) {
      console.error("Error fetching routes:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [queries, isLoading]);

  // Get action methods from the actions hook
  const actions = useRouteActions(routes, setRoutes, setProcessingRoutes, fetchRoutes);
  
  // Set up auto-refresh mechanism with memoized callback to prevent infinite loops
  // Fix: Make sure refreshCallback returns the Promise from fetchRoutes
  const refreshCallback = useCallback(() => {
    return fetchRoutes();
  }, [fetchRoutes]);
  
  useRouteRefresh(processingRoutes, lastRefresh, setLastRefresh, refreshCallback);
  
  // Load routes on first mount only
  useEffect(() => {
    let mounted = true;
    
    const loadInitialRoutes = async () => {
      // Only fetch routes once on initial mount
      if (mounted && !initialFetchDone.current) {
        initialFetchDone.current = true;
        await fetchRoutes();
      }
    };
    
    loadInitialRoutes();
    
    return () => {
      mounted = false;
    };
  }, [fetchRoutes]);  

  // Return all hooks and state
  return {
    routes,
    isLoading,
    processingRoutes,
    fetchRoutes,
    startRoute: actions.startRoute,
    completeRoute: actions.completeRoute,
    fetchRouteData: queries.fetchRouteData,
    fetchActiveRoutes: queries.fetchActiveRoutes,
    fetchRouteHistory: queries.fetchRouteHistory,
    fetchRouteDataByName: queries.fetchRouteDataByName,
    getWeeklyDeliveryData: queries.getWeeklyDeliveryData,
    getOptimizationStats: queries.getOptimizationStats
  };
};
