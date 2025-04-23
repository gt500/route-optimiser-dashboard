
// Route actions and business logic (optimize, fuel, data update, etc)
import { toast } from 'sonner';
import { useCallback } from 'react';
import { VehicleConfigProps, OptimizationParams, routeOptimizationDefaultParams } from './types';
import { LocationType } from '@/components/locations/LocationEditDialog';

export const useRouteActions = ({
  route, setRoute, vehicleConfig, setVehicleConfig
}: {
  route: any;
  setRoute: (fn: (route: any) => any) => void;
  vehicleConfig: VehicleConfigProps;
  setVehicleConfig: (config: VehicleConfigProps) => void;
}) => {

  const handleFuelCostUpdate = useCallback((newCost: number) => {
    setVehicleConfig({ ...vehicleConfig, fuelPrice: newCost });
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  }, [vehicleConfig, setVehicleConfig]);

  const handleRouteDataUpdate = useCallback((
    distance: number, duration: number, trafficConditions?: 'light' | 'moderate' | 'heavy'
  ) => {
    setRoute(prev => ({
      ...prev,
      distance,
      estimatedDuration: duration,
      trafficConditions: trafficConditions || prev.trafficConditions
    }));
  }, [setRoute]);

  const handleOptimize = useCallback((params: OptimizationParams = routeOptimizationDefaultParams) => {
    // Placeholder - assumed optimization function
    toast.success("Route optimized!");
    // Actual optimization logic handled in the composed parent hook
  }, []);

  // Any additional handlers can be added here

  return {
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleOptimize,
  };
};
