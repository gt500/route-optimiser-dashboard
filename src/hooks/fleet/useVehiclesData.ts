
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/fleet';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

// Get today's date
const today = new Date();

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
    lastService: format(subDays(today, 100), 'yyyy-MM-dd'), // About 3 months ago
    country: 'South Africa',
    region: 'Western Cape',
    maxPayload: 1760 // 1760 kg payload capacity (80 cylinders)
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
    lastService: format(subDays(today, 30), 'yyyy-MM-dd'), // 1 month ago
    country: 'South Africa',
    region: 'Western Cape',
    maxPayload: 1760 // 1760 kg payload capacity (80 cylinders)
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
        .eq('status', 'in_progress'); // Only consider in_progress routes for vehicle status

      console.log("Active routes for vehicle status update:", activeRoutes);
      
      if (!routesError && activeRoutes && activeRoutes.length > 0) {
        // Update vehicles based on active routes (in_progress only)
        updatedVehicles = updatedVehicles.map(vehicle => {
          // Always ensure TRK-001 has Western Cape region
          const updatedVehicle = {
            ...vehicle,
            region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region
          };
          
          // If it's TRK-001 and there are active routes, set to On Route
          if (vehicle.id === 'TRK-001' && activeRoutes.some(route => route.status === 'in_progress')) {
            return {
              ...updatedVehicle,
              status: 'On Route'
            };
          }
          
          return updatedVehicle;
        });
      } else {
        // If no active routes, ensure all vehicles are Available
        updatedVehicles = updatedVehicles.map(vehicle => {
          // Always ensure TRK-001 has Western Cape region
          const updatedVehicle = {
            ...vehicle,
            region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region
          };
          
          if (updatedVehicle.status === 'On Route') {
            console.log(`Setting ${vehicle.id} from "On Route" to "Available" because no active routes`);
            return {
              ...updatedVehicle,
              status: 'Available',
              load: 0
            };
          }
          
          return updatedVehicle;
        });
      }
      
      // Set the updated vehicles in state
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
      
      // Always enforce Western Cape region for TRK-001
      let updatedVehicle = {
        ...vehicle,
        region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region
      };
      
      // Update existing vehicle
      if (updatedVehicle.id) {
        // Update in our local state
        setVehicles(prev => 
          prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
        );
        
        toast.success(`Vehicle ${updatedVehicle.name} (${updatedVehicle.licensePlate}) updated successfully`);
      } else {
        // Add new vehicle
        const newVehicle = {
          ...updatedVehicle,
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

  // Initialize vehicle data when component mounts
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
