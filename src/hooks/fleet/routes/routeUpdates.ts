
import { RouteData } from '../types/routeTypes';
import { toast } from 'sonner';
import { updateRouteStatus } from './routeQueries';

/**
 * Start a route with the given ID
 */
export const startRoute = async (
  routeId: string, 
  routes: RouteData[],
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>,
  setProcessingRoutes: React.Dispatch<React.SetStateAction<Record<string, string>>>
): Promise<boolean> => {
  // Mark route as processing
  setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
  
  try {
    console.log(`Starting route with ID: ${routeId} in routeUpdates.ts`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Update the mock database
    await updateRouteStatus(routeId, 'in_progress');
    
    // Update route status in our state
    setRoutes(prev => 
      prev.map(route => 
        route.id === routeId ? { ...route, status: 'in_progress', vehicle_name: 'Leyland Ashok Phoenix' } : route
      )
    );
    
    console.log("Route status updated to in_progress");
    toast.success("Route started successfully");
    return true;
  } catch (error) {
    console.error('Error in startRoute:', error);
    toast.error('Failed to start route');
    return false;
  } finally {
    // Clear processing state
    setProcessingRoutes(prev => {
      const updated = { ...prev };
      delete updated[routeId];
      return updated;
    });
  }
};

/**
 * Complete a route with the given ID
 */
export const completeRoute = async (
  routeId: string, 
  routes: RouteData[],
  setRoutes: React.Dispatch<React.SetStateAction<RouteData[]>>,
  setProcessingRoutes: React.Dispatch<React.SetStateAction<Record<string, string>>>
): Promise<boolean> => {
  // Mark route as processing
  setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
  
  try {
    console.log(`Completing route with ID: ${routeId} in routeUpdates.ts`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the mock database
    const updated = await updateRouteStatus(routeId, 'completed');
    
    if (!updated) {
      throw new Error('Failed to update route status');
    }
    
    // Update route status in our state
    setRoutes(prev => 
      prev.map(route => 
        route.id === routeId ? { ...route, status: 'completed', vehicle_name: 'Leyland Ashok Phoenix' } : route
      )
    );
    
    console.log("Route status updated to completed");
    toast.success("Route marked as completed");
    return true;
  } catch (error) {
    console.error('Error in completeRoute:', error);
    toast.error('Failed to complete route');
    return false;
  } finally {
    // Clear processing state
    setProcessingRoutes(prev => {
      const updated = { ...prev };
      delete updated[routeId];
      return updated;
    });
  }
};
