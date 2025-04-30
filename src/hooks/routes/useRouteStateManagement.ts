
import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState } from './types';
import { useLocationSync } from './useLocationSync';
import { useVehicleConfig } from './useVehicleConfig';

/**
 * Hook for managing core route state - locations, start/end points, confirmation status
 */
export const useRouteStateManagement = (initialLocations: LocationType[] = []) => {
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
  
  // Update route when start/end locations change
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
  
  // Filter available locations based on current route
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
  
  return {
    route,
    setRoute,
    availableLocations,
    setAvailableLocations,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
    isLoadConfirmed,
    setIsLoadConfirmed,
    selectedVehicle,
    setSelectedVehicle,
    vehicleConfig,
    updateVehicleConfig,
    isSyncingLocations
  };
};
