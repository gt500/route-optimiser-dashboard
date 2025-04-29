
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

// Initial vehicles data - Both trucks are Leyland Ashok Phoenix
const initialVehicles: Vehicle[] = [
  { 
    id: 'TRK-001', 
    name: 'Leyland Ashok Phoenix', 
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
    name: 'Leyland Ashok Phoenix', 
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
  }
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
        .select('id, status, vehicle_id')
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
          
          // Check if this vehicle is assigned to any active route
          const vehicleHasActiveRoute = activeRoutes.some(route => route.vehicle_id === vehicle.id);
          
          if (vehicleHasActiveRoute) {
            return {
              ...updatedVehicle,
              status: 'On Route'
            };
          }
          
          return updatedVehicle;
        });
      } else {
        // If no active routes, ensure all vehicles are Available
        updatedVehicles = updatedVehicles.map(vehicle => ({
          ...vehicle,
          region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region,
          status: 'Available',
          load: 0,
          startDate: formattedReferenceDate // Ensure April 16th start date
        }));
      }
      
      // Set the updated vehicles in state (ensure we only have 2 vehicles)
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
        region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region,
        startDate: formattedReferenceDate, // Always ensure April 16th start date
        name: 'Leyland Ashok Phoenix', // Ensure consistent vehicle name
      };
      
      // Update existing vehicle
      if (updatedVehicle.id) {
        // Only allow updates to our two approved vehicles
        if (updatedVehicle.id !== 'TRK-001' && updatedVehicle.id !== 'TRK-002') {
          toast.error(`Cannot update vehicle. Only Leyland Ashok Phoenix trucks are in the fleet.`);
          return false;
        }
        
        // Update in our local state
        setVehicles(prev => 
          prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
        );
        
        toast.success(`Vehicle ${updatedVehicle.name} (${updatedVehicle.licensePlate}) updated successfully`);
      } else {
        // We shouldn't add new vehicles as we're limited to 2
        toast.error("Maximum of 2 vehicles allowed in the fleet");
        return false;
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
