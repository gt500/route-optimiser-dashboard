
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

      // Create route record
      const { data, error } = await supabase.from('routes').insert([
        {
          name: `${route.locations[0]?.name} to ${route.locations[route.locations.length - 1]?.name}`,
          date: new Date().toISOString(),
          status: 'scheduled',
          total_distance: route.distance,
          total_duration: route.estimatedDuration,
          total_fuel_cost: route.fuelCost,
          total_cylinders: route.cylinders,
          vehicle_id: selectedVehicle,
          traffic_conditions: route.trafficConditions,
          country: route.country,
          region: route.region,
          stops: stops
        }
      ]).select();

      if (error) {
        console.error('Error saving route:', error);
        toast.error('Failed to save route');
        return;
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
