
import { useCallback } from 'react';
import { toast } from 'sonner';
import { updateRouteStatus } from '../routes/routeQueries';
import type { RouteData } from '../types/routeTypes';

/**
 * Hook containing action methods for route data
 */
export const useRouteActions = (
  routes: RouteData[],
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>,
  setProcessingRoutes: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fetchRoutes: () => Promise<RouteData[]>
) => {

  // Optimized route status update
  const startRoute = useCallback(async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in useRouteActions hook`);
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
  }, [fetchRoutes, setRoutes, setProcessingRoutes]);

  // Optimized route completion with improved feedback
  const completeRoute = useCallback(async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in useRouteActions hook`);
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Update the route status
      const success = await updateRouteStatus(routeId, 'completed');
      
      if (!success) {
        throw new Error('Failed to update route status');
      }
      
      // Update local state immediately for better UI feedback
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, status: 'completed', vehicle_name: route.vehicle_name || 'Leyland Ashok Phoenix' } 
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
  }, [fetchRoutes, setRoutes, setProcessingRoutes]);

  return {
    startRoute,
    completeRoute,
  };
};
