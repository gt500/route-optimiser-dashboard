
import { useState } from 'react';
import { useVehicleConfig } from './useVehicleConfig';

/**
 * Hook for managing vehicle selection state for routes
 */
export const useRouteVehicleState = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const { vehicleConfig, updateVehicleConfig } = useVehicleConfig();
  
  return {
    selectedVehicle,
    setSelectedVehicle,
    vehicleConfig,
    updateVehicleConfig
  };
};
