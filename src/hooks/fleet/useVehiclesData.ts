
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
        .in('status', ['in_progress']); // Only consider in_progress routes for vehicle status

      if (!routesError && activeRoutes && activeRoutes.length > 0) {
        // Update vehicles based on active routes (in_progress only)
        updatedVehicles = updatedVehicles.map(vehicle => {
          // For demonstration, assuming TRK-001 is assigned to a route if there's any route in progress
          if (vehicle.id === 'TRK-001' && activeRoutes.some(route => route.status === 'in_progress')) {
            return {
              ...vehicle,
              status: 'On Route',
              region: 'Western Cape' // Ensure region is always Western Cape for TRK-001
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
      
      // Enforce Western Cape region for TRK-001
      let updatedVehicle = vehicle;
      if (vehicle.id === 'TRK-001') {
        updatedVehicle = {
          ...vehicle,
          region: 'Western Cape'
        };
      }
      
      // Update existing vehicle
      if (updatedVehicle.id) {
        // First update in our local state
        setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        
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
