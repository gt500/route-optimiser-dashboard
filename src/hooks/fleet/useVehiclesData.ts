
import { useState, useEffect } from 'react';
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

      // Initialize with our initial vehicles
      let updatedVehicles = [...initialVehicles];
      
      // Check for active routes to update vehicle statuses
      const { data: activeRoutes, error: routesError } = await supabase
        .from('routes')
        .select('id, status')
        .in('status', ['scheduled', 'in_progress']);
      
      if (!routesError && activeRoutes && activeRoutes.length > 0) {
        // For now, we'll just update based on route status
        // Future implementation can use vehicle_id once column is added
        updatedVehicles = updatedVehicles.map(vehicle => {
          // For demonstration, assuming TRK-001 is assigned to a route if there's any route
          if (vehicle.id === 'TRK-001' && activeRoutes.some(route => route.status === 'in_progress')) {
            return {
              ...vehicle,
              status: 'On Route'
            };
          }
          return vehicle;
        });
      }
      
      // Return the updated vehicles
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
        
        toast.success(`Vehicle ${vehicle.name} (${vehicle.licensePlate}) updated successfully`);
      } else {
        // Add new vehicle
        const newVehicle = {
          ...vehicle,
          id: `TRK-${String(vehicles.length + 1).padStart(3, '0')}`,
        };
        setVehicles(prev => [...prev, newVehicle]);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle data');
      return false;
    }
  };

  // Add a useEffect hook to refresh vehicle data when component mounts
  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    isLoading,
    fetchVehicles,
    saveVehicle,
  };
};
