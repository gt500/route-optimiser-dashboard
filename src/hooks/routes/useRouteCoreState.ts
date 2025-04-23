
// Basic definition of core state: route, endpoints, isLoadConfirmed
import { useState } from 'react';
import { RouteState, defaultVehicleConfig } from './types';
import { LocationType } from '@/components/locations/LocationEditDialog';

export const useRouteCoreState = (
  initialLocations: LocationType[] = []
) => {
  const [route, setRoute] = useState<RouteState>({
    distance: 0,
    fuelConsumption: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    totalCost: 0,
    cylinders: 0,
    locations: [],
    availableLocations: initialLocations,
    trafficConditions: 'moderate',
    estimatedDuration: 0,
    usingRealTimeData: false,
    country: '',
    region: '',
    waypointData: []
  });

  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  const [isLoadConfirmed, setIsLoadConfirmed] = useState(false);

  return {
    route, setRoute,
    startLocation, setStartLocation,
    endLocation, setEndLocation,
    isLoadConfirmed, setIsLoadConfirmed
  };
};

