
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmptyRouteState from './active-routes/EmptyRouteState';
import RoutesTable from './active-routes/RoutesTable';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';

const ActiveRoutesTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});
  const { fetchActiveRoutes } = useRouteData();
  const { vehicles, saveVehicle, fetchVehicles } = useVehiclesData();

  // Load routes when component mounts
  useEffect(() => {
    loadRoutes();
  }, []);

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
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      // Get the route details
      const route = routes.find(r => r.id === routeId);
      if (!route) {
        throw new Error('Route not found');
      }
      
      console.log(`Starting route ${routeId}, vehicle assignment: ${route.vehicle_id || 'none'}`);
      
      // Update route status to 'in_progress'
      const { error } = await supabase
        .from('routes')
        .update({ status: 'in_progress' })
        .eq('id', routeId)
        .eq('status', 'scheduled'); // Only update if currently scheduled
      
      if (error) {
        console.error('Error updating route status:', error);
        throw error;
      }
      
      // If there's a vehicle assigned to this route, update its status
      if (route.vehicle_id) {
        const vehicleToUpdate = vehicles.find(v => v.id === route.vehicle_id);
        if (vehicleToUpdate) {
          console.log(`Updating assigned vehicle ${vehicleToUpdate.id} status to On Route`);
          await saveVehicle({
            ...vehicleToUpdate,
            status: 'On Route',
            region: vehicleToUpdate.id === 'TRK-001' ? 'Western Cape' : vehicleToUpdate.region
          });
        }
      } else {
        // If no vehicle assigned, use the first available vehicle
        const availableVehicle = vehicles.find(v => v.status === 'Available');
        if (availableVehicle) {
          console.log(`No vehicle assigned, updating ${availableVehicle.id} status to On Route`);
          await saveVehicle({
            ...availableVehicle,
            status: 'On Route',
            region: availableVehicle.id === 'TRK-001' ? 'Western Cape' : availableVehicle.region
          });
          
          // Update the route with the vehicle ID
          const { error: updateError } = await supabase
            .from('routes')
            .update({ vehicle_id: availableVehicle.id })
            .eq('id', routeId);
            
          if (updateError) {
            console.error('Error updating route with vehicle ID:', updateError);
          }
        }
      }
      
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
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Get the route to find assigned vehicle
      const routeToComplete = routes.find(r => r.id === routeId);
      if (!routeToComplete) {
        throw new Error('Route not found');
      }
      
      console.log(`Marking route ${routeId} as completed, assigned vehicle: ${routeToComplete.vehicle_id || 'none'}`);
      
      // Update route status to 'completed'
      const { error } = await supabase
        .from('routes')
        .update({ status: 'completed' })
        .eq('id', routeId);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // If the route has an assigned vehicle, update that vehicle specifically
      if (routeToComplete.vehicle_id) {
        const assignedVehicle = vehicles.find(v => v.id === routeToComplete.vehicle_id);
        if (assignedVehicle) {
          console.log(`Setting assigned vehicle ${assignedVehicle.id} from "On Route" to "Available"`);
          await saveVehicle({
            ...assignedVehicle,
            status: 'Available', // Always set vehicle back to Available
            load: 0, // Reset the load since the route is complete
            region: assignedVehicle.id === 'TRK-001' ? 'Western Cape' : assignedVehicle.region // Ensure TRK-001 is Western Cape
          });
        }
      } else {
        // If no vehicle is assigned, update any vehicles that are 'On Route'
        const vehiclesOnRoute = vehicles.filter(v => v.status === 'On Route');
        console.log(`Found ${vehiclesOnRoute.length} vehicles on route to update status`);
        
        for (const vehicle of vehiclesOnRoute) {
          console.log(`Setting vehicle ${vehicle.id} from "On Route" to "Available"`);
          await saveVehicle({
            ...vehicle,
            status: 'Available', // Always set vehicle back to Available
            load: 0, // Reset the load since the route is complete
            region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region // Ensure TRK-001 is Western Cape
          });
        }
      }
      
      toast.success('Route marked as completed');
      
      // First, update the local state for immediate feedback
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId 
            ? { ...route, status: 'completed' } 
            : route
        )
      );
      
      // Then reload all routes data for full synchronization
      await loadRoutes();
    } catch (error) {
      console.error('Error completing route:', error);
      toast.error('Failed to complete route');
      
      // Rollback the optimistic update if there was an error
      await loadRoutes();
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
        />
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
