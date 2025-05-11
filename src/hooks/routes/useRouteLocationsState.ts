
import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState } from './types';

/**
 * Hook for managing locations state and relationships within a route
 */
export const useRouteLocationsState = (
  availableLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>
) => {
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  
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
  }, [startLocation, endLocation, setRoute]);
  
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
  }, [availableLocations, setRoute]);

  return {
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation
  };
};
