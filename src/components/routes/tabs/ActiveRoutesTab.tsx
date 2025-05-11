
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
  const loadRoutes = useCallback(async () => {
    console.log("Loading active routes...");
    setIsLoading(true);
    try {
      let activeRoutes = await fetchActiveRoutes();
      console.log('Loaded active routes:', activeRoutes);
      
      // Ensure all routes have the correct vehicle name
      activeRoutes = activeRoutes.map(route => ({
        ...route,
        vehicle_name: 'Leyland Ashok Phoenix'
      }));
      
      setRoutes(activeRoutes);
      
      // Refresh vehicle data to ensure statuses are in sync with routes
      await fetchVehicles();
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load active routes');
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveRoutes, fetchVehicles]);

  // Load routes when component mounts or when highlightedDeliveryId changes
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes, highlightedDeliveryId]);

  // Optimized route start handler
  const handleStartRoute = async (routeId: string) => {
    console.log(`Starting route with ID: ${routeId} in ActiveRoutesTab`);
    
    try {
      // Call the startRoute function from the hook
      const success = await startRoute(routeId);
      
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
    } catch (error) {
      console.error('Error starting route:', error);
      toast.error('Failed to start route');
    }
  };

  // Optimized route completion handler
  const handleCompleteRoute = async (routeId: string) => {
    console.log(`Completing route with ID: ${routeId} in ActiveRoutesTab`);
    
    try {
      // Call the completeRoute function from the hook
      const success = await completeRoute(routeId);
      
      if (success) {
        // Update local state immediately for better UX
        setRoutes(prev => prev.filter(route => route.id !== routeId));
        
        toast.success('Route completed successfully');
      } else {
        toast.error('Failed to complete route');
      }
    } catch (error) {
      console.error('Error completing route:', error);
      toast.error('Failed to complete route');
    }
  };

  // Show loading state
  if (isLoading || isHookLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>Loading active routes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show empty state if no routes
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

  // Show populated routes table
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
          onStartRoute={handleStartRoute} 
          onCompleteRoute={handleCompleteRoute} 
          highlightedDeliveryId={highlightedDeliveryId}
        />
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
