
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
    status: 'On Route', 
    capacity: 80, 
    load: 65, 
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
      
      const { data, error } = await supabase
        .from('routes')
        .select('id, total_distance, total_cylinders, estimated_cost, date, status');
      
      if (error) {
        throw error;
      }

      // If we don't have any routes data yet, use the initial vehicles
      if (!data || data.length === 0) {
        setVehicles(initialVehicles);
        return initialVehicles;
      }

      // For now, we don't have a vehicles table yet in Supabase,
      // so we're using initial vehicles
      setVehicles(initialVehicles);
      return initialVehicles;
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
      // Since we don't have a vehicles table yet in Supabase,
      // we handle locally only for now
      if (vehicle.id) {
        // Update existing vehicle
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? vehicle : v));
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

  return {
    vehicles,
    isLoading,
    fetchVehicles,
    saveVehicle,
  };
};
