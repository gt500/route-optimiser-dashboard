
import { useEffect, useRef } from 'react';
import type { RouteData } from '../types/routeTypes';

/**
 * Hook for setting up optimized route refresh timers
 */
export const useRouteRefresh = (
  processingRoutes: Record<string, string>,
  lastRefresh: number,
  setLastRefresh: React.Dispatch<React.SetStateAction<number>>,
  fetchRoutes: () => Promise<void | RouteData[]>
) => {
  // Ref to track pending refresh operations
  const pendingRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshAttemptRef = useRef<number>(0);

  // Auto-refresh mechanism with throttling
  useEffect(() => {
    // Clear any existing timer to prevent duplicate refreshes
    if (pendingRefreshRef.current) {
      clearTimeout(pendingRefreshRef.current);
      pendingRefreshRef.current = null;
    }
    
    // Check if we're processing any routes - if so, refresh more frequently
    const isProcessing = Object.keys(processingRoutes).length > 0;
    
    // Throttle refreshes: min 5s between refreshes when processing, 40s otherwise
    const minRefreshInterval = isProcessing ? 5000 : 40000;
    const now = Date.now();
    const timeSinceLastAttempt = now - lastRefreshAttemptRef.current;
    
    // Don't attempt refresh if we've tried too recently
    if (timeSinceLastAttempt < minRefreshInterval) {
      // Schedule next refresh after the minimum interval has passed
      const timeToNextRefresh = minRefreshInterval - timeSinceLastAttempt;
      pendingRefreshRef.current = setTimeout(() => {
        lastRefreshAttemptRef.current = Date.now();
        fetchRoutes().then(() => {
          setLastRefresh(Date.now());
        }).catch(err => {
          console.error("Error in auto refresh:", err);
        });
      }, timeToNextRefresh);
    } else {
      // It's been long enough, schedule refresh immediately
      pendingRefreshRef.current = setTimeout(() => {
        lastRefreshAttemptRef.current = Date.now();
        fetchRoutes().then(() => {
          setLastRefresh(Date.now());
        }).catch(err => {
          console.error("Error in auto refresh:", err);
        });
      }, isProcessing ? 50 : 300); // Small delay to allow batching of React updates
    }
    
    return () => {
      if (pendingRefreshRef.current) {
        clearTimeout(pendingRefreshRef.current);
      }
    };
  }, [lastRefresh, processingRoutes, fetchRoutes, setLastRefresh]);
};
