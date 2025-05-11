
import { useState, useCallback } from 'react';
import { RouteState, VehicleConfigProps } from './types';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';

export const useRouteHandlers = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  startLocation: LocationType | null,
  setStartLocation: React.Dispatch<React.SetStateAction<LocationType | null>>,
  endLocation: LocationType | null,
  setEndLocation: React.Dispatch<React.SetStateAction<LocationType | null>>,
  availableLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  vehicleConfig: VehicleConfigProps,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  updateVehicleConfig: (config: Partial<VehicleConfigProps>) => void
) => {
  const handleFuelCostUpdate = useCallback((newCost: number) => {
    console.log("Fuel cost updated to:", newCost);
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  }, []);

  const handleRouteDataUpdate = useCallback((
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => {
    console.log("Received route data update:", { 
      distance, duration, 
      trafficInfo: trafficConditions,
      waypoints: waypointData?.length || 0
    });
    
    // Ensure we have valid minimum values
    const validDistance = distance > 0 ? distance : Math.max(5.0 * route.locations.length, 0.1);
    const validDuration = duration > 0 ? duration : Math.max(15 * route.locations.length, 1);
    
    setRoute(prev => {
      // Use the fuel calculation utility to get more accurate consumption based on valid distance
      const consumption = (validDistance * vehicleConfig.baseConsumption) / 100;
      const cost = consumption * vehicleConfig.fuelPrice;
      
      console.log(`Route data updated: distance=${validDistance}km, duration=${validDuration}mins, consumption=${consumption}L, cost=${cost}`);
      
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
    handleStartLocationChange: useCallback((locationId: string) => {
      console.log("Setting start location to:", locationId);
      const location = availableLocations.find(loc => loc.id === locationId);
      
      if (location) {
        setStartLocation(location);
        
        setRoute(prev => {
          // Start location should be at the beginning of the locations array
          const filteredLocations = prev.locations.filter(
            loc => loc.id !== location.id && loc.id !== (endLocation?.id || '')
          );
          
          return {
            ...prev,
            locations: [
              location,
              ...filteredLocations,
              ...(endLocation ? [endLocation] : [])
            ]
          };
        });
      }
    }, [availableLocations, endLocation, setRoute, setStartLocation]),

    handleEndLocationChange: useCallback((locationId: string) => {
      console.log("Setting end location to:", locationId);
      const location = availableLocations.find(loc => loc.id === locationId);
      
      if (location) {
        setEndLocation(location);
        
        setRoute(prev => {
          // End location should be at the end of the locations array
          const filteredLocations = prev.locations.filter(
            loc => loc.id !== location.id && loc.id !== (startLocation?.id || '')
          );
          
          return {
            ...prev,
            locations: [
              ...(startLocation ? [startLocation] : []),
              ...filteredLocations,
              location
            ]
          };
        });
      }
    }, [availableLocations, startLocation, setEndLocation, setRoute]),

    handleCreateNewRoute: useCallback(() => {
      console.log("Creating new route");
      // Reset route state
      setRoute({
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
      
      // Reset start and end locations
      setStartLocation(null);
      setEndLocation(null);
      
      // Reset load confirmation
      setIsLoadConfirmed(false);
      
      toast.success("Created new route");
    }, [setRoute, setStartLocation, setEndLocation, setIsLoadConfirmed]),

    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover: useCallback((locationId: string | number) => {
      console.log("Adding new location from popover:", locationId);
      // Find the location by ID
      const location = availableLocations.find(loc => loc.id === locationId);
      
      if (location) {
        // Assume cylinders value in popover is set to a default
        const locationWithCylinders = {
          ...location,
          cylinders: 10 // Default value when added from popover
        };
        
        // Reuse addLocationToRoute logic (implemented in useRouteOperations)
        // This will be provided via the composed hook
        toast.success(`Added ${location.name} to route`);
      } else {
        toast.error("Location not found");
      }
    }, [availableLocations]),

    handleUpdateLocations: useCallback((newLocations: LocationType[]) => {
      console.log("Updating all locations:", newLocations.length);
      setAvailableLocations(newLocations);
    }, [setAvailableLocations])
  };
};
