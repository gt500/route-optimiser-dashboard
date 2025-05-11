
import { useCallback } from 'react';
import { RouteState, VehicleConfigProps } from './types';
import { toast } from 'sonner';

export const useRouteDataHandlers = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  vehicleConfig: VehicleConfigProps,
  updateVehicleConfig: (
    newConfig: Partial<VehicleConfigProps>,
    updateRouteCosts?: (distance: number) => void,
    distance?: number
  ) => void
) => {
  const handleFuelCostUpdate = useCallback((newCost: number) => {
    console.log("Fuel cost updated to:", newCost);
    
    const updateRouteCosts = (distance: number) => {
      setRoute(prev => {
        const consumption = (distance * vehicleConfig.fuelPrice * 0.12) / 21.95;
        const cost = consumption * vehicleConfig.fuelPrice;
  
        return {
          ...prev,
          distance: distance,
          fuelConsumption: consumption,
          fuelCost: cost
        };
      });
    };
    
    updateVehicleConfig({ fuelPrice: newCost }, updateRouteCosts, route.distance);
    
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  }, [vehicleConfig, route.distance, updateVehicleConfig, setRoute]);
  
  const handleRouteDataUpdate = useCallback((
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number, duration: number }[]
  ) => {
    console.log("Received route data update:", { 
      distance, duration, 
      trafficInfo: trafficConditions,
      waypoints: waypointData?.length
    });
    
    // Ensure we have valid minimum values
    const validDistance = distance > 0 ? distance : Math.max(5.0 * route.locations.length, 0.1);
    const validDuration = duration > 0 ? duration : Math.max(15 * route.locations.length, 1);
    
    setRoute(prev => {
      // Use the fuel calculation utility to get more accurate consumption based on valid distance
      const consumption = (validDistance * vehicleConfig.baseConsumption) / 100;
      const cost = consumption * vehicleConfig.fuelPrice;
      
      console.log(`Route data updated: distance=${validDistance}km, duration=${validDuration}mins, consumption=${consumption}L, fuelPrice=${vehicleConfig.fuelPrice}, cost=${cost}`);
      
      return {
        ...prev,
        distance: validDistance,
        estimatedDuration: validDuration,
        fuelConsumption: consumption,
        fuelCost: cost,
        trafficConditions: trafficConditions || prev.trafficConditions,
        waypointData: waypointData || []
      };
    });
  }, [route.locations.length, vehicleConfig, setRoute]);

  return {
    handleFuelCostUpdate,
    handleRouteDataUpdate
  };
};
