
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
      // First fetch vehicles
      const vehiclesData = await fetchVehicles();
      
      // Then fetch route data
      const routeData = await fetchRouteData();
      
      // Check if we need to update vehicle statuses
      const inProgressRoutes = routeData.filter(route => route.status === 'in_progress');
      if (inProgressRoutes.length === 0) {
        // If no routes are in progress, make sure all vehicles are Available
        for (const vehicle of vehiclesData) {
          if (vehicle.status === 'On Route') {
            await saveVehicle({
              ...vehicle,
              status: 'Available',
              load: 0
            });
          }
        }
      }
      
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
