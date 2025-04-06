
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, MaintenanceItem } from '@/types/fleet';
import { toast } from 'sonner';

export const useFleetData = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fuelEfficiency: { value: 0, target: 10, unit: 'km/L' },
    fleetUtilization: { value: 0, target: 80, unit: '%' },
    maintenanceCompliance: { value: 0, target: 95, unit: '%' },
    onTimeDeliveries: { value: 0, target: 90, unit: '%' }
  });

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
        
        setVehicles(initialVehicles);
        calculateFleetPerformance(initialVehicles, []);
        return;
      }

      // We have route data, use it to calculate metrics
      const routeData = data;
      
      // For now, we don't have a vehicles table, so use initial vehicles
      // In the future, this could be replaced with actual data from a vehicles table
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
      
      setVehicles(initialVehicles);
      calculateFleetPerformance(initialVehicles, routeData);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      toast.error('Failed to load fleet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch maintenance data
  const fetchMaintenanceItems = async () => {
    try {
      // In the future, fetch from maintenance table
      // For now, use static data
      const maintenanceSchedule: MaintenanceItem[] = [
        { vehicle: 'Leyland Phoenix (CA 123-456)', type: 'Engine Service', date: '2023-12-05', status: 'In Progress' },
        { vehicle: 'Leyland Phoenix (CA 789-012)', type: 'Tire Replacement', date: '2023-12-12', status: 'Scheduled' },
      ];
      
      setMaintenanceItems(maintenanceSchedule);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to load maintenance data');
    }
  };

  // Calculate fleet performance metrics using real data
  const calculateFleetPerformance = (vehicleData: Vehicle[], routeData: any[]) => {
    // Calculate fuel efficiency based on routes
    let totalDistance = 0;
    let totalFuelConsumption = 0;
    let onTimeCount = 0;
    let totalDeliveries = 0;

    // Process route data for metrics
    if (routeData.length > 0) {
      // Sum up total distance
      totalDistance = routeData.reduce((sum, route) => sum + (route.total_distance || 0), 0);
      
      // Get base fuel consumption from cost_factors if available
      const fetchFuelConsumption = async () => {
        const { data: fuelData, error } = await supabase
          .from('cost_factors')
          .select('value')
          .eq('name', 'base_fuel_consumption')
          .single();
          
        if (!error && fuelData) {
          // Calculate fuel consumption using the value from the database
          const baseConsumption = fuelData.value || 12; // L/100km
          totalFuelConsumption = (totalDistance * baseConsumption) / 100;
          updateMetrics();
        } else {
          // Use default if no data is available
          const baseConsumption = 12; // L/100km
          totalFuelConsumption = (totalDistance * baseConsumption) / 100;
          updateMetrics();
        }
      };
      
      // Calculate on-time delivery percentage
      totalDeliveries = routeData.length;
      onTimeCount = routeData.filter(route => 
        route.status === 'completed' || 
        route.status === 'delivered' || 
        route.status === 'on_time').length;
      
      fetchFuelConsumption();
    } else {
      updateMetrics();
    }
    
    function updateMetrics() {
      // Calculate fleet utilization
      const activeVehicles = vehicleData.filter(v => v.status === 'On Route').length;
      const utilizationRate = (vehicleData.length > 0) 
        ? (activeVehicles / vehicleData.length) * 100 
        : 0;

      // Calculate maintenance compliance
      // Ideally would be based on scheduled vs. completed maintenance records
      // For now using a fairly high percentage, adjusted slightly by vehicles in 'Maintenance' status
      const vehiclesInMaintenance = vehicleData.filter(v => v.status === 'Maintenance').length;
      const maintenanceCompliance = 92 - (vehiclesInMaintenance > 0 ? 2 : 0); // Lower if vehicles are in maintenance
      
      // Set fuel efficiency (km/L)
      const fuelEfficiency = totalDistance > 0 && totalFuelConsumption > 0
        ? totalDistance / totalFuelConsumption
        : 8.3; // Default if no data
        
      // Calculate on-time delivery percentage
      const onTimePercentage = totalDeliveries > 0 
        ? (onTimeCount / totalDeliveries) * 100 
        : 88; // Default if no data

      setPerformanceMetrics({
        fuelEfficiency: { 
          value: Number(fuelEfficiency.toFixed(1)), 
          target: 10, 
          unit: 'km/L' 
        },
        fleetUtilization: { 
          value: Math.round(utilizationRate), 
          target: 80, 
          unit: '%' 
        },
        maintenanceCompliance: { 
          value: maintenanceCompliance, 
          target: 95, 
          unit: '%' 
        },
        onTimeDeliveries: { 
          value: Math.round(onTimePercentage), 
          target: 90, 
          unit: '%' 
        }
      });
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
      
      // Recalculate performance metrics
      fetchVehicles();
      
      return true;
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle data');
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    fetchVehicles();
    fetchMaintenanceItems();
  }, []);

  return {
    vehicles,
    maintenanceItems,
    performanceMetrics,
    isLoading,
    saveVehicle,
    refreshData: () => {
      fetchVehicles();
      fetchMaintenanceItems();
    }
  };
};

export default useFleetData;
