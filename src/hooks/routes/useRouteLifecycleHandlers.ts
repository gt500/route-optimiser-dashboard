
import { useCallback } from 'react';
import { RouteState } from './types';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';

export const useRouteLifecycleHandlers = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  availableLocations: LocationType[],
  setStartLocation: (location: LocationType | null) => void,
  setEndLocation: (location: LocationType | null) => void
) => {
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
  }, [availableLocations, route.country, route.region, setStartLocation, setEndLocation, setIsLoadConfirmed, setRoute]);

  return {
    handleCreateNewRoute
  };
};
