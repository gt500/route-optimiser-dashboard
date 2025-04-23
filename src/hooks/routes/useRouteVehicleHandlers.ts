
// Logic for handling vehicle config and selected vehicle
import { useState } from 'react';
import { defaultVehicleConfig, VehicleConfigProps } from './types';

export const useRouteVehicleHandlers = () => {
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfigProps>(defaultVehicleConfig);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  // Re-export for compatibility
  return { vehicleConfig, setVehicleConfig, selectedVehicle, setSelectedVehicle };
};
