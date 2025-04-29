
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { supabase } from '@/integrations/supabase/client';
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
  const { fetchActiveRoutes, startRoute: startRouteHook, completeRoute: completeRouteHook } = useRouteData();
  const { vehicles, saveVehicle, fetchVehicles } = useVehiclesData();

  // Load routes when component mounts or when highlightedDeliveryId changes
  useEffect(() => {
    loadRoutes();
  }, [highlightedDeliveryId]);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const activeRoutes = await fetchActiveRoutes();
      console.log('Loaded active routes:', activeRoutes);
      
      // Ensure that each route with a vehicle_id also has a vehicle_name
      const routesWithVehicleInfo = activeRoutes.map(route => {
        if (route.vehicle_id && !route.vehicle_name) {
          const vehicle = vehicles.find(v => v.id === route.vehicle_id);
          if (vehicle) {
            return {
              ...route,
              vehicle_name: `${vehicle.name} (${vehicle.licensePlate})`
            };
          }
        }
        return route;
      });
      
      setRoutes(routesWithVehicleInfo);
      
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
    console.log(`Starting route with ID: ${routeId}`);
    
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      // Call the startRoute function from the hook
      await startRouteHook(routeId);
      
      // Update local state for immediate feedback
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'in_progress' } : route
        )
      );
      
      toast.success('Route started successfully');
      
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
    console.log(`Completing route with ID: ${routeId}`);
    
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Call the completeRoute function from the hook
      await completeRouteHook(routeId);
      
      // Update local state for immediate feedback - remove the route from active routes
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      
      toast.success('Route completed successfully');
      
      // No need to reload routes here since we've already removed it from the list
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
