
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

      // Ensure we have valid distance and duration values
      const totalDistance = Math.max(5.0, route.distance);
      const totalDuration = Math.max(30, route.estimatedDuration || 0);
      const totalCylinders = Math.max(0, route.cylinders);
      const estimatedCost = Math.round((route.fuelCost + route.maintenanceCost) * 100) / 100;

      console.log("Saving route with metrics:", {
        distance: totalDistance,
        duration: totalDuration,
        cylinders: totalCylinders,
        cost: estimatedCost
      });

      // Create route record - ensuring we set the status to 'scheduled' for active routes
      const { data, error } = await supabase.from('routes').insert({
        id: routeId,
        name: `${route.locations[0]?.name} to ${route.locations[route.locations.length - 1]?.name}`,
        date: new Date().toISOString(),
        status: 'scheduled', // Explicitly set to 'scheduled' to ensure it appears in active routes
        total_distance: totalDistance,
        total_duration: totalDuration,
        estimated_cost: estimatedCost,
        total_cylinders: totalCylinders,
        vehicle_id: selectedVehicle
      }).select();

      if (error) {
        console.error('Error saving route:', error);
        toast.error('Failed to save route');
        return;
      }
      
      // Now save the route metadata separately to the deliveries table
      if (data && data.length > 0) {
        // Calculate total deliveries for distance distribution
        const totalDeliveries = route.locations.filter(loc => loc.type === 'Customer').length;
        
        // Get segment-specific data from the route locations
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

          // For other stops, use the pre-calculated segment metrics if available
          let segmentDistance = loc.segmentDistance || 0;
          let segmentDuration = loc.segmentDuration || 0;
          let segmentFuelCost = loc.segmentCost || 0;
          
          // If we don't have segment-specific data, calculate from waypoint data or distribute evenly
          if (!segmentDistance) {
            const previousWaypoint = Math.max(0, index - 1);
            const segmentData = route.waypointData && route.waypointData[previousWaypoint];
            
            if (segmentData?.distance && segmentData.distance > 0) {
              segmentDistance = segmentData.distance;
              segmentDuration = segmentData.duration || 0;
            } else if (totalDistance > 0 && route.locations.length > 1) {
              // Distribute distance if no specific data is available
              if (index === 1) {
                segmentDistance = totalDistance * 0.35; // First leg gets 35% of distance
              } else if (index === route.locations.length - 1) {
                segmentDistance = totalDistance * 0.35; // Last leg gets 35% of distance
              } else {
                const midPointCount = Math.max(1, route.locations.length - 2);
                segmentDistance = (totalDistance * 0.3) / midPointCount; // Middle stops share remaining 30%
              }
              
              // Distribute duration proportionally to distance
              segmentDuration = totalDuration * (segmentDistance / totalDistance);
            }
            
            // Calculate segment fuel consumption and cost
            const segmentFuelConsumption = calculateSegmentFuelConsumption(
              segmentDistance, 
              route.locations,
              index,
              route.trafficConditions === 'heavy'
            );
            
            segmentFuelCost = calculateFuelCost(
              segmentFuelConsumption, 
              route.fuelCost / Math.max(0.1, route.fuelConsumption)
            );
          }
          
          return {
            location_id: loc.id,
            location_name: loc.name,
            cylinders: loc.type === 'Customer' ? (loc.emptyCylinders || 0) : (loc.fullCylinders || 0),
            order: index,
            distance: parseFloat(segmentDistance.toFixed(1)),
            duration: segmentDuration || totalDuration / Math.max(1, route.locations.length - 1),
            fuel_cost: parseFloat(Number(segmentFuelCost).toFixed(2))
          };
        });
        
        console.log("Saving route stops with metrics:", stops);
        
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
      
      // Invalidate the route cache to force a refresh
      try {
        await fetch('/api/routes/refresh-cache', { method: 'POST' });
      } catch (err) {
        console.log('Cache refresh not available, active routes will update on next reload');
      }
    } catch (err) {
      console.error('Error in handleConfirmLoad:', err);
      toast.error('Failed to confirm load');
    }
  };

  return { handleConfirmLoad };
};
