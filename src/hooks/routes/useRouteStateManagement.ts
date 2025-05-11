
import { useState } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState } from './types';
import { useLocationSync } from './useLocationSync';
import { useRouteLocationsState } from './useRouteLocationsState';
import { useRouteVehicleState } from './useRouteVehicleState';
import { useRouteConfirmationState } from './useRouteConfirmationState';

/**
 * Hook for managing core route state - coordinates all the sub-state hooks
 */
export const useRouteStateManagement = (initialLocations: LocationType[] = []) => {
  const { availableLocations, setAvailableLocations, isSyncingLocations } = useLocationSync(initialLocations);
  
  // Initialize the core route state
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
  
  // Get location state management
  const {
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation
  } = useRouteLocationsState(availableLocations, setAvailableLocations, setRoute);
  
  // Get vehicle state management
  const {
    selectedVehicle,
    setSelectedVehicle,
    vehicleConfig,
    updateVehicleConfig
  } = useRouteVehicleState();
  
  // Get confirmation state
  const {
    isLoadConfirmed,
    setIsLoadConfirmed
  } = useRouteConfirmationState();
  
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
