
import { useState } from 'react';
import { toast } from 'sonner';
import { RouteState } from './types';
import { supabase } from '@/integrations/supabase/client';
import { calculateSegmentFuelConsumption, calculateFuelCost } from '@/utils/route/fuelUtils';

export const useSaveRoute = (
  route: RouteState,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  selectedVehicle: string | null
) => {
  const handleConfirmLoad = async () => {
    // Validate necessary data
    if (route.locations.length < 2) {
      toast.error('Add at least two locations to create a route');
      return;
    }

    if (!selectedVehicle) {
      toast.error('Please select a vehicle before confirming the load');
      return;
    }

    try {
      // Generate a UUID for the route
      const routeId = crypto.randomUUID();

      // Create route record - ensuring we match the exact schema expected by Supabase
      const { data, error } = await supabase.from('routes').insert({
        id: routeId,
        name: `${route.locations[0]?.name} to ${route.locations[route.locations.length - 1]?.name}`,
        date: new Date().toISOString(),
        status: 'scheduled',
        total_distance: route.distance,
        total_duration: route.estimatedDuration,
        estimated_cost: route.fuelCost,
        total_cylinders: route.cylinders,
        vehicle_id: selectedVehicle
      }).select();

      if (error) {
        console.error('Error saving route:', error);
        toast.error('Failed to save route');
        return;
      }
      
      // Now save the route metadata separately to the deliveries table
      if (data && data.length > 0) {
        // Create stops data with accurate segment metrics
        const stops = route.locations.map((loc, index) => {
          // First stop has no distance or cost
          if (index === 0) {
            return {
              location_id: loc.id,
              location_name: loc.name,
              cylinders: loc.type === 'Customer' ? (loc.emptyCylinders || 0) : (loc.fullCylinders || 0),
              order: index,
              distance: 0,
              duration: 0,
              fuel_cost: 0
            };
          }

          // For other stops, calculate segment-specific metrics
          // Use waypointData if available for more accuracy
          const previousWaypoint = Math.max(0, index - 1);
          const segmentData = route.waypointData && route.waypointData[previousWaypoint];
          
          // Get accurate segment distance
          const segmentDistance = segmentData?.distance || 
            (route.distance / Math.max(1, route.locations.length - 1));
          
          // Calculate fuel consumption for this specific segment based on load
          const segmentFuelConsumption = calculateSegmentFuelConsumption(
            segmentDistance, 
            route.locations,
            index,
            route.trafficConditions === 'heavy'
          );
          
          // Calculate segment cost based on actual consumption
          const segmentFuelCost = calculateFuelCost(segmentFuelConsumption, route.fuelCost / Math.max(0.1, route.fuelConsumption));
          
          return {
            location_id: loc.id,
            location_name: loc.name,
            cylinders: loc.type === 'Customer' ? (loc.emptyCylinders || 0) : (loc.fullCylinders || 0),
            order: index,
            distance: parseFloat(segmentDistance.toFixed(1)),
            duration: segmentData?.duration || route.estimatedDuration / Math.max(1, route.locations.length - 1),
            fuel_cost: parseFloat(segmentFuelCost.toFixed(2))
          };
        });
        
        // Create deliveries for each stop except the first one (which is the depot)
        const deliveryPromises = stops.slice(1).map(async (stop, index) => {
          const { error: deliveryError } = await supabase.from('deliveries').insert({
            id: crypto.randomUUID(),
            route_id: routeId,
            location_id: stop.location_id,
            cylinders: stop.cylinders,
            sequence: index + 1
          });
          
          if (deliveryError) {
            console.error('Error creating delivery:', deliveryError);
          }
        });
        
        await Promise.all(deliveryPromises);
      }
      
      console.log('Route saved successfully:', data);
      setIsLoadConfirmed(true);
      toast.success('Load confirmed and route scheduled');
    } catch (err) {
      console.error('Error in handleConfirmLoad:', err);
      toast.error('Failed to confirm load');
    }
  };

  return { handleConfirmLoad };
};
