
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';
import EmptyRouteState from './active-routes/EmptyRouteState';
import RoutesTable from './active-routes/RoutesTable';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';

interface ActiveRoutesTabProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveRoutesTab = ({ onCreateRoute, highlightedDeliveryId }: ActiveRoutesTabProps) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});
  const { 
    fetchActiveRoutes, 
    routes: routesFromHook, 
    startRoute: startRouteHook, 
    completeRoute: completeRouteHook,
    fetchRoutes: refreshAllRoutes
  } = useRouteData();
  const { vehicles, fetchVehicles } = useVehiclesData();

  // Load routes when component mounts or when highlightedDeliveryId changes
  useEffect(() => {
    loadRoutes();
  }, [highlightedDeliveryId]);
  
  // Add this effect to update local state when routesFromHook changes
  useEffect(() => {
    if (routesFromHook && routesFromHook.length > 0) {
      const activeFilteredRoutes = routesFromHook.filter(
        route => route.status === 'scheduled' || route.status === 'in_progress'
      );
      console.log("Active filtered routes from hook:", activeFilteredRoutes);
      setRoutes(activeFilteredRoutes);
    }
  }, [routesFromHook]);

  const loadRoutes = async () => {
    console.log("Loading active routes...");
    setIsLoading(true);
    try {
      // First refresh all routes to ensure we have the latest data
      await refreshAllRoutes();
      
      const activeRoutes = await fetchActiveRoutes();
      console.log('Loaded active routes:', activeRoutes);
      
      // Ensure each route has proper data
      const routesWithCorrectData = activeRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix',
        stops: route.stops || []
      }));
      
      console.log("Setting active routes:", routesWithCorrectData);
      setRoutes(routesWithCorrectData);
      
      // Refresh vehicle data to ensure statuses are in sync with routes
      await fetchVehicles();
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load active routes');
    } finally {
      setIsLoading(false);
    }
  };

  const startRoute = async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in ActiveRoutesTab`);
    
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      // Call the startRoute function from the hook
      const success = await startRouteHook(routeId);
      
      if (success) {
        // Update local state for immediate feedback
        setRoutes(prev => 
          prev.map(route => 
            route.id === routeId ? { ...route, status: 'in_progress', vehicle_name: 'Leyland Ashok Phoenix' } : route
          )
        );
        
        toast.success('Route started successfully');
      } else {
        toast.error('Failed to start route');
      }
      
      // Reload routes to ensure everything is up-to-date
      await loadRoutes();
    } catch (error) {
      console.error('Error starting route:', error);
      toast.error('Failed to start route');
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  };

  const markRouteAsComplete = async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in ActiveRoutesTab`);
    
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Call the completeRoute function from the hook
      const success = await completeRouteHook(routeId);
      
      if (success) {
        // Update local state for immediate feedback - remove the route from active routes
        setRoutes(prev => prev.filter(route => route.id !== routeId));
        
        toast.success('Route completed successfully');
      } else {
        toast.error('Failed to complete route');
      }
      
      // Reload routes to ensure everything is up-to-date
      await loadRoutes();
    } catch (error) {
      console.error('Error completing route:', error);
      toast.error('Failed to complete route');
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>Loading active routes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>
            Currently active delivery routes
          </CardDescription>
        </CardHeader>
        <EmptyRouteState onCreateRoute={onCreateRoute} />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Routes</CardTitle>
        <CardDescription>Currently active delivery routes</CardDescription>
      </CardHeader>
      <CardContent>
        <RoutesTable 
          routes={routes} 
          processingRoutes={processingRoutes} 
          onStartRoute={startRoute} 
          onCompleteRoute={markRouteAsComplete} 
          highlightedDeliveryId={highlightedDeliveryId}
        />
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
