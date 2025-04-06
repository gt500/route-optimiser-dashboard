
import { useState, useEffect } from 'react';
import { Vehicle, MaintenanceItem, FleetPerformanceMetrics } from '@/types/fleet';
import { useVehiclesData } from './fleet/useVehiclesData';
import { useMaintenanceData } from './fleet/useMaintenanceData';
import { usePerformanceMetrics } from './fleet/usePerformanceMetrics';
import { useRouteData } from './fleet/useRouteData';

export const useFleetData = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Import individual hooks
  const { vehicles, fetchVehicles, saveVehicle } = useVehiclesData();
  const { maintenanceItems, fetchMaintenanceItems } = useMaintenanceData();
  const { performanceMetrics, calculateFleetPerformance } = usePerformanceMetrics();
  const { fetchRouteData } = useRouteData();

  // Initialize data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // First fetch vehicles and route data
      const vehiclesData = await fetchVehicles();
      const routeData = await fetchRouteData();
      
      // Then calculate performance using that data
      await calculateFleetPerformance(vehiclesData, routeData);
      
      // Finally fetch maintenance data
      await fetchMaintenanceItems();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return {
    vehicles,
    maintenanceItems,
    performanceMetrics,
    isLoading,
    saveVehicle,
    refreshData
  };
};

export default useFleetData;
