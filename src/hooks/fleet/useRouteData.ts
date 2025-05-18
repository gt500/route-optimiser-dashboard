
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
  
  // Add refs to track initial mount and prevent duplicate fetches
  const initialFetchDone = useRef(false);
  const isFetchingRoutes = useRef(false);
  const requestsQueue = useRef<(() => void)[]>([]);
  
  // Process queued requests one at a time
  const processQueue = useCallback(() => {
    if (requestsQueue.current.length > 0 && !isFetchingRoutes.current) {
      const nextRequest = requestsQueue.current.shift();
      if (nextRequest) nextRequest();
    }
  }, []);

  // Get query methods from the query hook
  const queries = useRouteQueries(routes);
  
  // Wrapper for fetchRoutes that updates state with debouncing
  const fetchRoutes = useCallback(async () => {
    // If already fetching, queue this request for later
    if (isFetchingRoutes.current) {
      return new Promise<RouteData[]>(resolve => {
        const queuedFetch = async () => {
          try {
            const result = await fetchRoutes();
            resolve(result);
          } catch (error) {
            console.error("Error in queued fetch:", error);
            resolve([]);
          }
        };
        
        requestsQueue.current.push(queuedFetch);
      });
    }
    
    try {
      isFetchingRoutes.current = true;
      setIsLoading(true);
      console.log("Fetching all routes in useRouteData hook");
      const fetchedRoutes = await queries.fetchRoutes();
      console.log(`Retrieved ${fetchedRoutes.length} routes`);
      setRoutes(fetchedRoutes);
      return fetchedRoutes;
    } catch (error) {
      console.error("Error fetching routes:", error);
      return [];
    } finally {
      setIsLoading(false);
      isFetchingRoutes.current = false;
      // Process next queued request if any
      setTimeout(processQueue, 0);
    }
  }, [queries, processQueue]);

  // Get action methods from the actions hook
  const actions = useRouteActions(routes, setRoutes, setProcessingRoutes, fetchRoutes);
  
  // Set up auto-refresh mechanism with memoized callback to prevent infinite loops
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
