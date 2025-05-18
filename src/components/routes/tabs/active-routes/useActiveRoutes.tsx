
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import { toast } from 'sonner';

export const useActiveRoutes = (highlightedDeliveryId?: string | null) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const cachedRoutesRef = useRef<RouteData[]>([]);
  
  // Get the optimized hooks
  const { 
    fetchActiveRoutes, 
    startRoute, 
    completeRoute,
    isLoading: isHookLoading,
    processingRoutes
  } = useRouteData();
  const { fetchVehicles } = useVehiclesData();

  // Load routes when component mounts or when highlightedDeliveryId changes
  const loadRoutes = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate concurrent fetches
    if (loadingRef.current) {
      console.log("Already loading routes, skipping duplicate fetch");
      return;
    }
    
    // Throttle fetches to no more than once every 2 seconds unless forced
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimeRef.current < 2000) {
      console.log("Throttling route fetches, using cached data");
      
      // If we have cached data, use it immediately
      if (cachedRoutesRef.current.length > 0) {
        setRoutes(cachedRoutesRef.current);
        return;
      }
    }
    
    console.log("Loading active routes...");
    try {
      loadingRef.current = true;
      setIsLoading(true);
      
      // Use the cached data to show something immediately while loading
      if (cachedRoutesRef.current.length > 0) {
        setRoutes(cachedRoutesRef.current);
      }
      
      let activeRoutes = await fetchActiveRoutes();
      console.log('Loaded active routes:', activeRoutes);
      lastFetchTimeRef.current = Date.now();
      
      // Ensure all routes have the correct vehicle name
      activeRoutes = activeRoutes.map(route => ({
        ...route,
        vehicle_name: route.vehicle_name || 'Leyland Ashok Phoenix'
      }));
      
      // Highlight route with the specified delivery if it exists
      if (highlightedDeliveryId) {
        activeRoutes = activeRoutes.map(route => {
          if (route.stops && route.stops.some(stop => stop.id === highlightedDeliveryId)) {
            return {
              ...route,
              highlighted: true
            };
          }
          return route;
        });
      }
      
      // Update the cache and state
      cachedRoutesRef.current = activeRoutes;
      setRoutes(activeRoutes);
      
      // Refresh vehicle data without blocking the UI update
      fetchVehicles().catch(err => {
        console.error("Background vehicle fetch failed:", err);
      });
      
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load active routes');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [fetchActiveRoutes, fetchVehicles, highlightedDeliveryId]);

  // Only fetch when component mounts or highlightedDeliveryId changes, not on every render
  useEffect(() => {
    // Initial load with whatever we have in cache first
    if (cachedRoutesRef.current.length > 0) {
      setRoutes(cachedRoutesRef.current);
      setIsLoading(false);
    }
    
    // Then fetch fresh data
    loadRoutes();
    
    // Set up a periodic refresh with a more reasonable interval (30 seconds)
    const intervalId = setInterval(() => {
      loadRoutes();
    }, 30000); 
    
    return () => clearInterval(intervalId);
  }, [loadRoutes]);

  // Optimized route start handler with better error handling
  const handleStartRoute = useCallback(async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in useActiveRoutes`);
    
    try {
      // Update UI optimistically
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'in_progress', vehicle_name: 'Leyland Ashok Phoenix' } : route
        )
      );
      
      // Call the startRoute function from the hook
      const success = await startRoute(routeId);
      
      if (success) {
        toast.success('Route started successfully');
        return true;
      } else {
        // Revert optimistic update on failure
        loadRoutes(true);
        toast.error('Failed to start route');
        return false;
      }
    } catch (error) {
      console.error('Error starting route:', error);
      // Revert optimistic update on error
      loadRoutes(true);
      toast.error('Failed to start route');
      return false;
    }
  }, [startRoute, loadRoutes]);

  // Optimized route completion handler with better error handling
  const handleCompleteRoute = useCallback(async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in useActiveRoutes`);
    
    try {
      // Update UI optimistically
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      
      // Call the completeRoute function from the hook
      const success = await completeRoute(routeId);
      
      if (success) {
        toast.success('Route completed successfully');
        return true;
      } else {
        // Revert optimistic update on failure
        loadRoutes(true);
        toast.error('Failed to complete route');
        return false;
      }
    } catch (error) {
      console.error('Error completing route:', error);
      // Revert optimistic update on error
      loadRoutes(true);
      toast.error('Failed to complete route');
      return false;
    }
  }, [completeRoute, loadRoutes]);

  return {
    routes,
    isLoading: isLoading || isHookLoading,
    processingRoutes,
    handleStartRoute,
    handleCompleteRoute,
    loadRoutes
  };
};
