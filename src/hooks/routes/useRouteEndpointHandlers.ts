
import { useCallback } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';

export interface RouteEndpointHandlersParams {
  availableLocations: LocationType[];
  setStartLocation: (location: LocationType | null) => void;
  setEndLocation: (location: LocationType | null) => void;
}

export const useRouteEndpointHandlers = ({
  availableLocations,
  setStartLocation,
  setEndLocation
}: RouteEndpointHandlersParams) => {
  
  const handleStartLocationChange = useCallback((locationId: string) => {
    console.log("Start location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    if (location) {
      console.log("Found start location:", location);
      setStartLocation(location);
    } else {
      console.error("Could not find location with ID:", locationId);
    }
  }, [availableLocations, setStartLocation]);
  
  const handleEndLocationChange = useCallback((locationId: string) => {
    console.log("End location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    setEndLocation(location || null);
  }, [availableLocations, setEndLocation]);
  
  return {
    handleStartLocationChange,
    handleEndLocationChange
  };
};
