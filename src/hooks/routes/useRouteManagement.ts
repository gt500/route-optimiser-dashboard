
import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import { useLocationSync } from './useLocationSync';
import { useVehicleConfig } from './useVehicleConfig';
import { useRouteOperations } from './useRouteOperations';
import { useSaveRoute } from './useSaveRoute';
import { 
  RouteState, 
  OptimizationParams, 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig, 
  MAX_CYLINDERS, 
  CYLINDER_WEIGHT_KG 
} from './types';

export { 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig, 
  MAX_CYLINDERS, 
  CYLINDER_WEIGHT_KG 
} from './types';

export type { VehicleConfigProps } from './types';

const useRouteManagement = (initialLocations: LocationType[] = []) => {
  const { availableLocations, setAvailableLocations, isSyncingLocations } = useLocationSync(initialLocations);
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  const [isLoadConfirmed, setIsLoadConfirmed] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const { vehicleConfig, updateVehicleConfig } = useVehicleConfig();
  
  const [route, setRoute] = useState<RouteState>({
    distance: 0,
    fuelConsumption: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    totalCost: 0,
    cylinders: 0,
    locations: [],
    availableLocations: [],
    trafficConditions: 'moderate',
    estimatedDuration: 0,
    usingRealTimeData: false,
    country: '',
    region: '',
    waypointData: []
  });

  const { 
    addLocationToRoute, 
    removeLocationFromRoute, 
    handleOptimize, 
    updateRouteCosts,
    handleReplaceLocation 
  } = useRouteOperations(
    route, 
    setRoute, 
    startLocation, 
    endLocation, 
    availableLocations, 
    setAvailableLocations,
    vehicleConfig
  );

  const { handleConfirmLoad } = useSaveRoute(route, setIsLoadConfirmed, selectedVehicle);

  const handleCreateNewRoute = () => {
    setStartLocation(null);
    setEndLocation(null);
    setIsLoadConfirmed(false);
    setRoute({
      distance: 0,
      fuelConsumption: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      totalCost: 0,
      cylinders: 0,
      locations: [],
      availableLocations: availableLocations,
      trafficConditions: 'moderate',
      estimatedDuration: 75,
      usingRealTimeData: false,
      country: route.country,
      region: route.region,
      waypointData: []
    });
    toast.info("New route created");
  };

  const handleRouteDataUpdate = (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number, duration: number }[]
  ) => {
    if (distance <= 0 || isNaN(distance)) return;
    
    setRoute(prev => {
      const consumption = (distance * vehicleConfig.fuelPrice * 0.12) / 21.95;
      const cost = consumption * vehicleConfig.fuelPrice;
      
      return {
        ...prev,
        distance,
        estimatedDuration: duration,
        fuelConsumption: consumption,
        fuelCost: cost,
        trafficConditions: trafficConditions || prev.trafficConditions,
        waypointData: waypointData || []
      };
    });
  };

  const handleUpdateLocations = (updatedLocations: LocationType[]) => {
    setAvailableLocations(updatedLocations);
    
    setRoute(prev => {
      const updatedRouteLocations = prev.locations.map(routeLoc => {
        const updatedLoc = updatedLocations.find(loc => loc.id === routeLoc.id);
        if (updatedLoc) {
          return {
            ...routeLoc,
            name: updatedLoc.name,
            address: updatedLoc.address,
            type: updatedLoc.type
          };
        }
        return routeLoc;
      });
      
      return {
        ...prev,
        locations: updatedRouteLocations
      };
    });
  };

  const setRouteRegion = (country: string, region: string) => {
    setRoute(prev => ({
      ...prev,
      country,
      region
    }));
  };

  useEffect(() => {
    if (startLocation) {
      setRoute(prev => {
        const existingMiddleLocations = prev.locations.filter(loc => 
          loc.id !== startLocation.id && 
          (endLocation ? loc.id !== endLocation.id : true)
        );
        
        const newLocations = [
          startLocation,
          ...existingMiddleLocations
        ];
        
        if (endLocation) {
          newLocations.push(endLocation);
        }
        
        return {
          ...prev,
          locations: newLocations
        };
      });
    }
  }, [startLocation, endLocation]);

  useEffect(() => {
    setRoute(prev => {
      const routeLocationIds = prev.locations.map(loc => loc.id);
      const filteredAvailableLocations = availableLocations.filter(loc => 
        !routeLocationIds.includes(loc.id)
      );
      
      return {
        ...prev,
        availableLocations: filteredAvailableLocations
      };
    });
  }, [availableLocations, route.locations]);

  return {
    route,
    availableLocations,
    startLocation,
    endLocation,
    vehicleConfig,
    isLoadConfirmed,
    isSyncingLocations,
    setStartLocation,
    setEndLocation,
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    handleCreateNewRoute,
    handleRouteDataUpdate,
    handleConfirmLoad,
    handleUpdateLocations,
    handleReplaceLocation,
    setIsLoadConfirmed,
    setAvailableLocations,
    updateVehicleConfig,
    selectedVehicle,
    setSelectedVehicle,
    setRouteRegion
  };
};

export default useRouteManagement;
