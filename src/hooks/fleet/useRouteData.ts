
import { useState, useCallback, useEffect } from 'react';
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

  // Get query methods from the query hook
  const queries = useRouteQueries(routes);
  
  // Wrapper for fetchRoutes that updates state
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedRoutes = await queries.fetchRoutes();
      setRoutes(fetchedRoutes);
      return fetchedRoutes;
    } finally {
      setIsLoading(false);
    }
  }, [queries]);

  // Get action methods from the actions hook
  const actions = useRouteActions(routes, setRoutes, setProcessingRoutes, fetchRoutes);
  
  // Set up auto-refresh mechanism with memoized callback to prevent infinite loops
  const refreshCallback = useCallback(() => {
    fetchRoutes();
  }, [fetchRoutes]);
  
  useRouteRefresh(processingRoutes, lastRefresh, setLastRefresh, refreshCallback);
  
  // Load routes on first mount only
  useEffect(() => {
    let mounted = true;
    
    const loadInitialRoutes = async () => {
      if (mounted) {
        await fetchRoutes();
      }
    };
    
    loadInitialRoutes();
    
    return () => {
      mounted = false;
    };
  }, []);  // Empty dependency array means this only runs once

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
