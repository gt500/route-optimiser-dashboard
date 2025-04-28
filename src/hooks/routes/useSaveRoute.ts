
import { useState } from 'react';
import { toast } from 'sonner';
import { RouteState } from './types';
import { supabase } from '@/integrations/supabase/client';

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
      // Create stops data
      const stops = route.locations.map((loc, index) => {
        // Calculate individual stop costs based on waypoint data if available
        const waypointData = route.waypointData[index - 1] || { distance: 0, duration: 0 };
        const distance = waypointData.distance || 0;
        
        // Calculate fuel cost for this segment based on distance
        const fuelConsumptionRate = route.fuelConsumption / route.distance; // L per km
        const segmentFuelConsumption = distance * fuelConsumptionRate;
        const segmentFuelCost = segmentFuelConsumption * (route.fuelCost / route.fuelConsumption);
        
        return {
          location_id: loc.id,
          location_name: loc.name,
          cylinders: loc.type === 'Customer' ? (loc.emptyCylinders || 0) : (loc.fullCylinders || 0),
          order: index,
          distance: distance,
          duration: waypointData.duration || 0,
          fuel_cost: parseFloat(segmentFuelCost.toFixed(2)) || 0
        };
      });

      // Prepare route metadata as a JSON string since there's no dedicated column for stops
      const routeMetadata = JSON.stringify({
        stops: stops,
        trafficConditions: route.trafficConditions,
        country: route.country,
        region: route.region
      });

      // Create route record - ensuring we match the exact schema expected by Supabase
      const { data, error } = await supabase.from('routes').insert({
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
        const routeId = data[0].id;
        
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
