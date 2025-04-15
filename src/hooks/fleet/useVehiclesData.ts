
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/fleet';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

// Get today's date
const today = new Date();
// Fixed reference date: April 16, 2025
const REFERENCE_START_DATE = new Date(2025, 3, 16); // Note: Month is 0-indexed, so 3 = April
const formattedReferenceDate = format(REFERENCE_START_DATE, 'yyyy-MM-dd');

// Initial vehicles data - ensure we only have 2 vehicles
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
    startDate: formattedReferenceDate, // April 16, 2025
    country: 'South Africa',
    region: 'Western Cape',
    maxPayload: 1760, // 1760 kg payload capacity (80 cylinders)
    odometer: 25840 // Example: ~7,040 km/month for ~3.7 months
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
    startDate: formattedReferenceDate, // April 16, 2025
    country: 'South Africa',
    region: 'Western Cape',
    maxPayload: 1760, // 1760 kg payload capacity (80 cylinders)
    odometer: 11500 // Example: Lower mileage for newer vehicle
  },
];

export const useVehiclesData = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vehicles data
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);

      // Always initialize with only our 2 vehicles
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
            region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region,
            startDate: formattedReferenceDate // Ensure April 16th start date
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
      
      // Set the updated vehicles in state (but ensure we only have 2 vehicles)
      // Slice to only take the first two vehicles, in case there are more
      setVehicles(updatedVehicles.slice(0, 2));
      return updatedVehicles.slice(0, 2);
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
        region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region,
        startDate: formattedReferenceDate // Always ensure April 16th start date
      };
      
      // Update existing vehicle
      if (updatedVehicle.id) {
        // Update in our local state
        setVehicles(prev => 
          prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
        );
        
        toast.success(`Vehicle ${updatedVehicle.name} (${updatedVehicle.licensePlate}) updated successfully`);
      } else {
        // We shouldn't add new vehicles as we're limited to 2
        // This logic is kept but will not be used
        const newVehicle = {
          ...updatedVehicle,
          id: `TRK-${String(vehicles.length + 1).padStart(3, '0')}`,
          startDate: formattedReferenceDate // Ensure April 16th start date
        };
        
        // Only add the new vehicle if we would still have at most 2 vehicles
        if (vehicles.length < 2) {
          setVehicles(prev => [...prev, newVehicle]);
        } else {
          toast.error("Maximum of 2 vehicles allowed in the fleet");
          return false;
        }
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
