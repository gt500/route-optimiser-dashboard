import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import { useLocationSync } from './routes/useLocationSync';
import { useVehicleConfig } from './routes/useVehicleConfig';
import { useRouteOperations } from './routes/useRouteOperations';
import { useSaveRoute } from './routes/useSaveRoute';
import { 
  RouteState, 
  OptimizationParams, 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig, 
  MAX_CYLINDERS, 
  CYLINDER_WEIGHT_KG 
} from './routes/types';

export { 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig, 
  MAX_CYLINDERS, 
  CYLINDER_WEIGHT_KG 
} from './routes/types';

export type { VehicleConfigProps } from './routes/types';

export const useRouteManagement = (initialLocations: LocationType[] = []) => {
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
    locations: [] as LocationType[],
    availableLocations: [] as LocationType[],
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

  useEffect(() => {
    if (startLocation) {
      console.log("Start location set:", startLocation);
      setRoute(prev => {
        const existingMiddleLocations = prev.locations.filter(loc => 
          loc.id !== startLocation.id && 
          (endLocation ? loc.id !== endLocation.id : true) &&
          (prev.locations[0] ? loc.id !== prev.locations[0].id : true) && 
          (prev.locations.length > 1 ? loc.id !== prev.locations[prev.locations.length - 1].id : true)
        );
        
        const newLocations = [
          startLocation,
          ...existingMiddleLocations
        ];
        
        if (endLocation) {
          newLocations.push(endLocation);
        }
        
        console.log("Updated route locations:", newLocations);
        
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
      
      console.log("Filtered available locations:", filteredAvailableLocations.length);
      
      return {
        ...prev,
        availableLocations: filteredAvailableLocations
      };
    });
  }, [availableLocations, route.locations]);

  const handleStartLocationChange = (locationId: string) => {
    console.log("Start location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    if (location) {
      console.log("Found start location:", location);
      setStartLocation(location);
    } else {
      console.error("Could not find location with ID:", locationId);
    }
  };

  const handleEndLocationChange = (locationId: string) => {
    console.log("End location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    setEndLocation(location || null);
  };

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
      region: route.region
    });
    toast.info("New route created");
  };

  const handleFuelCostUpdate = (newCost: number) => {
    console.log("Fuel cost updated to:", newCost);
    
    updateVehicleConfig({ fuelPrice: newCost }, updateRouteCosts, route.distance);
    
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  };

  const handleRouteDataUpdate = (
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
    
    if (distance <= 0 || isNaN(distance)) {
      console.warn("Invalid distance received:", distance);
      return;
    }
    
    setRoute(prev => {
      const consumption = (distance * vehicleConfig.fuelPrice * 0.12) / 21.95;
      const cost = consumption * vehicleConfig.fuelPrice;
      
      console.log(`Route data updated: distance=${distance}km, duration=${duration}mins, consumption=${consumption}L, fuelPrice=${vehicleConfig.fuelPrice}, cost=${cost}`);
      
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

  const handleAddNewLocationFromPopover = (locationId: string | number) => {
    console.log("Adding location from popover with ID:", locationId);
    const stringLocationId = String(locationId);
    const location = availableLocations.find(loc => loc.id.toString() === stringLocationId);
    
    if (location) {
      console.log("Found location to add:", location);
      addLocationToRoute({...location, cylinders: location.emptyCylinders || 10});
      toast.success(`Added ${location.name} to route`);
    } else {
      console.error("Could not find location with ID:", locationId);
      toast.error("Could not find the selected location");
    }
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
    handleStartLocationChange,
    handleEndLocationChange,
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
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
