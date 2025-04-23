
// All logic for adding/removing/changing route locations and availableLocations
import { useCallback } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';

export interface RouteLocationHandlersParams {
  route: any;
  setRoute: (fn: (route: any) => any) => void;
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  availableLocations: LocationType[];
  setAvailableLocations: (vals: LocationType[]) => void;
}

export const useRouteLocationHandlers = ({
  route, setRoute, startLocation, endLocation, availableLocations, setAvailableLocations
}: RouteLocationHandlersParams) => {
  // Add, Remove, Replace Location handlers
  const addLocationToRoute = useCallback((location: LocationType & { cylinders?: number }) => {
    setRoute((prev: any) => ({
      ...prev,
      locations: [...prev.locations, location],
      cylinders: (prev.cylinders || 0) + (location.cylinders || 0)
    }));
  }, [setRoute]);

  const removeLocationFromRoute = useCallback((index: number) => {
    setRoute(prev => {
      const updatedLocations = prev.locations.filter((_loc: LocationType, idx: number) => idx !== index);
      const removed = prev.locations[index];
      const removedCylinders = removed?.cylinders || 0;
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: Math.max(0, (prev.cylinders || 0) - removedCylinders),
      };
    });
    toast.success('Location removed from route');
  }, [setRoute]);

  const handleReplaceLocation = useCallback((idx: number, newLocation: LocationType) => {
    setRoute(prev => {
      const updatedLocations = [...prev.locations];
      updatedLocations[idx] = newLocation;
      return { ...prev, locations: updatedLocations };
    });
  }, [setRoute]);

  // Update all locations
  const handleUpdateLocations = useCallback((updatedLocations: LocationType[]) => {
    setAvailableLocations(updatedLocations);
    setRoute(prev => {
      const updatedRouteLocations = prev.locations.map((routeLoc: LocationType) => {
        const updatedLoc = updatedLocations.find(loc => loc.id === routeLoc.id);
        return updatedLoc
          ? { ...routeLoc, name: updatedLoc.name, address: updatedLoc.address, type: updatedLoc.type }
          : routeLoc;
      });
      return { ...prev, locations: updatedRouteLocations };
    });
  }, [setAvailableLocations, setRoute]);

  return {
    addLocationToRoute,
    removeLocationFromRoute,
    handleReplaceLocation,
    handleUpdateLocations,
  };
};
