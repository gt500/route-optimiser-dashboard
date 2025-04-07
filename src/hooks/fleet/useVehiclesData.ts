
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/fleet';
import { toast } from 'sonner';

// Initial vehicles data used when no database records exist
const initialVehicles: Vehicle[] = [
  { 
    id: 'TRK-001', 
    name: 'Leyland Phoenix', 
    licensePlate: 'CA 123-456',
    status: 'Available', 
    capacity: 80, 
    load: 0, 
    fuelLevel: 78, 
    location: 'Cape Town CBD', 
    lastService: '2023-10-15',
    country: 'South Africa',
    region: 'Western Cape'
  },
  { 
    id: 'TRK-002', 
    name: 'Leyland Phoenix', 
    licensePlate: 'CA 789-012',
    status: 'Available', 
    capacity: 80, 
    load: 0, 
    fuelLevel: 92, 
    location: 'Afrox Epping Depot', 
    lastService: '2023-11-02',
    country: 'South Africa',
    region: 'Western Cape'
  },
];

export const useVehiclesData = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vehicles data
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      
      // First try to get existing vehicles from routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, vehicle_id, status')
        .not('vehicle_id', 'is', null);
      
      if (routesError) {
        throw routesError;
      }

      // Initialize with our initial vehicles
      let updatedVehicles = [...initialVehicles];
      
      // Update vehicle status based on active routes
      if (routesData && routesData.length > 0) {
        updatedVehicles = updatedVehicles.map(vehicle => {
          // Check if this vehicle is assigned to any route
          const activeRoute = routesData.find(route => 
            route.vehicle_id === vehicle.id && 
            (route.status === 'scheduled' || route.status === 'in_progress')
          );
          
          if (activeRoute) {
            // If the vehicle is on an active route, set its status accordingly
            return {
              ...vehicle,
              status: 'On Route',
              load: 65, // Assuming a default load for active routes
            };
          }
          
          return vehicle;
        });
      }
      
      setVehicles(updatedVehicles);
      return updatedVehicles;
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      toast.error('Failed to load fleet data');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update a vehicle
  const saveVehicle = async (vehicle: Vehicle) => {
    try {
      console.log("Saving vehicle:", vehicle);
      
      // Update existing vehicle
      if (vehicle.id) {
        // First update in our local state
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
        
        // Then update in routes if status changed to or from "On Route"
        if (vehicle.status === 'On Route' || vehicle.status === 'Available') {
          // Get any route that might be associated with this vehicle
          const { data: routeData, error: routeError } = await supabase
            .from('routes')
            .select('id, status')
            .eq('vehicle_id', vehicle.id)
            .in('status', ['scheduled', 'in_progress'])
            .maybeSingle();
            
          if (routeError) {
            console.error('Error checking routes for vehicle:', routeError);
          } else if (routeData) {
            // If vehicle is no longer on route but the route is still active,
            // update the route status according to vehicle status
            if (vehicle.status === 'Available' && 
                (routeData.status === 'scheduled' || routeData.status === 'in_progress')) {
              // Update route to completed if vehicle is now available
              const { error: updateError } = await supabase
                .from('routes')
                .update({ status: 'completed' })
                .eq('id', routeData.id);
                
              if (updateError) {
                console.error('Error updating route status:', updateError);
              } else {
                toast.success('Route has been marked as completed');
              }
            }
          }
        }
      } else {
        // Add new vehicle
        const newVehicle = {
          ...vehicle,
          id: `TRK-${String(vehicles.length + 1).padStart(3, '0')}`,
        };
        setVehicles(prev => [...prev, newVehicle]);
      }
      
      toast.success(`Vehicle ${vehicle.name} (${vehicle.licensePlate}) updated successfully`);
      return true;
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle data');
      return false;
    }
  };

  return {
    vehicles,
    isLoading,
    fetchVehicles,
    saveVehicle,
  };
};
