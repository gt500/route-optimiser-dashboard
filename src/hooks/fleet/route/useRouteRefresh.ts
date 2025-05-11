
import { useEffect } from 'react';

/**
 * Hook for setting up route refresh timers
 */
export const useRouteRefresh = (
  processingRoutes: Record<string, string>,
  lastRefresh: number,
  setLastRefresh: React.Dispatch<React.SetStateAction<number>>,
  fetchRoutes: () => Promise<void | RouteData[]>
) => {
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
  }, [lastRefresh, processingRoutes, fetchRoutes, setLastRefresh]);
};

// Add import so TypeScript doesn't complain about missing RouteData
import { RouteData } from '../types/routeTypes';
