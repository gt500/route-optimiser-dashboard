
import { useCallback } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState, OptimizationParams, VehicleConfigProps } from './types';
import { toast } from 'sonner';

/**
 * Hook for route action handlers - creation, updates, location handling
 */
export const useRouteHandlers = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  startLocation: LocationType | null,
  endLocation: LocationType | null,
  availableLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  vehicleConfig: VehicleConfigProps,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  updateVehicleConfig: (
    newConfig: Partial<VehicleConfigProps>,
    updateRouteCosts?: (distance: number) => void,
    distance?: number
  ) => void
) => {
  
  const handleStartLocationChange = useCallback((locationId: string) => {
    console.log("Start location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    if (location) {
      console.log("Found start location:", location);
      setStartLocation(location);
    } else {
      console.error("Could not find location with ID:", locationId);
    }
  }, [availableLocations]);
  
  const handleEndLocationChange = useCallback((locationId: string) => {
    console.log("End location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    setEndLocation(location || null);
  }, [availableLocations]);
  
  const handleCreateNewRoute = useCallback(() => {
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
  }, [availableLocations, route.country, route.region]);
  
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
  }, [vehicleConfig, route.distance]);
  
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
  }, [route.locations.length, vehicleConfig]);
  
  const handleAddNewLocationFromPopover = useCallback((locationId: string | number) => {
    console.log("Adding location from popover with ID:", locationId);
    const stringLocationId = String(locationId);
    const location = availableLocations.find(loc => loc.id.toString() === stringLocationId);
    
    if (location) {
      console.log("Found location to add:", location);
      addLocationToRoute({
        ...location,
        cylinders: location.emptyCylinders || 10
      } as LocationType & { cylinders: number });
      toast.success(`Added ${location.name} to route`);
    } else {
      console.error("Could not find location with ID:", locationId);
      toast.error("Could not find the selected location");
    }
  }, [availableLocations]);
  
  const handleUpdateLocations = useCallback((updatedLocations: LocationType[]) => {
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
  }, []);
  
  const setRouteRegion = useCallback((country: string, region: string) => {
    setRoute(prev => ({
      ...prev,
      country,
      region
    }));
  }, []);
  
  const setStartLocation = useCallback((location: LocationType | null) => {
    // This is a wrapper function that will be implemented in the main hook
    // and connected to the state setter from useRouteStateManagement
  }, []);
  
  const setEndLocation = useCallback((location: LocationType | null) => {
    // This is a wrapper function that will be implemented in the main hook
    // and connected to the state setter from useRouteStateManagement
  }, []);
  
  // These functions will be connected to the implementations in useRouteOperations
  const addLocationToRoute = useCallback((location: LocationType & { cylinders: number }) => {
    // Placeholder - will be implemented in the main hook
  }, []);
  
  const removeLocationFromRoute = useCallback((locationId: string) => {
    // Placeholder - will be implemented in the main hook
  }, []);
  
  const handleOptimize = useCallback((params: OptimizationParams) => {
    // Placeholder - will be implemented in the main hook
  }, []);
  
  const replaceLocation = useCallback((oldLocationId: string, newLocationId: string) => {
    // Placeholder - will be implemented in the main hook
  }, []);
  
  return {
    handleStartLocationChange,
    handleEndLocationChange,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
    handleUpdateLocations,
    setRouteRegion
  };
};
