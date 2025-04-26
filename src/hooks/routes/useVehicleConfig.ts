
import { useState } from 'react';
import { VehicleConfigProps, defaultVehicleConfig } from './types';

export const useVehicleConfig = () => {
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfigProps>(defaultVehicleConfig);

  const updateVehicleConfig = (
    newConfig: Partial<VehicleConfigProps>,
    updateRouteCosts?: (distance: number) => void,
    distance?: number
  ) => {
    setVehicleConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (updateRouteCosts && typeof distance === 'number') {
        updateRouteCosts(distance);
      }
      return updated;
    });
  };

  return { vehicleConfig, updateVehicleConfig };
};
