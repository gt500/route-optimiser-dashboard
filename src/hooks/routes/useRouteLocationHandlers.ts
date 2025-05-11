
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
  // Handle updating all locations
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
  }, [setAvailableLocations, setRoute]);

  // Handle adding new location from popover
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

  // Handle adding location to route (implementation stub for composition)
  const addLocationToRoute = useCallback((location: LocationType & { cylinders: number }) => {
    // This will be implemented in the main hook composition
    console.log("Add location to route stub called with:", location);
  }, []);

  return {
    handleUpdateLocations,
    handleAddNewLocationFromPopover
  };
};
