
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
      // First fetch vehicles and routes
      const vehiclesData = await fetchVehicles();
      const routeData = await fetchRouteData();
      
      // Check for in-progress routes
      const inProgressRoutes = routeData.filter(route => route.status === 'in_progress');
      
      // Synchronize vehicle statuses with routes
      if (inProgressRoutes.length === 0) {
        console.log("No routes in progress, checking if any vehicles need status update");
        
        // If no routes are in progress, all vehicles should be Available
        for (const vehicle of vehiclesData) {
          if (vehicle.status === 'On Route') {
            console.log(`Setting vehicle ${vehicle.id} from "On Route" to "Available" during refresh`);
            await saveVehicle({
              ...vehicle,
              status: 'Available',
              load: 0,
              region: vehicle.id === 'TRK-001' ? 'Western Cape' : vehicle.region
            });
          }
        }
      } else {
        console.log(`Found ${inProgressRoutes.length} routes in progress`);
        
        // If TRK-001 is not already "On Route", update it
        const trk001 = vehiclesData.find(v => v.id === 'TRK-001');
        if (trk001 && trk001.status !== 'On Route') {
          console.log('Setting TRK-001 to "On Route" since there are active routes');
          await saveVehicle({
            ...trk001,
            status: 'On Route',
            region: 'Western Cape'
          });
        }
      }
      
      // Refetch vehicles to ensure we have the latest data after updates
      await fetchVehicles();
      
      // Then calculate performance using updated data
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
