
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState, OptimizationParams, routeOptimizationDefaultParams, defaultVehicleConfig } from './types';
import { useRouteStateManagement } from './useRouteStateManagement';
import { useRouteHandlers } from './useRouteHandlers';
import { useRouteOperations } from './useRouteOperations';
import { useSaveRoute } from './useSaveRoute';
import { useRouteRegionHandlers } from './useRouteRegionHandlers';

export { 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig 
} from './types';

export type { VehicleConfigProps } from './types';

/**
 * Main hook that composes all route-related functionality
 */
export const useRouteManagement = (initialLocations: LocationType[] = []) => {
  // Get core state management
  const {
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
  } = useRouteStateManagement(initialLocations);

  // Get route operations
  const { 
    addLocationToRoute, 
    removeLocationFromRoute, 
    handleOptimize, 
    updateRouteCosts, 
    replaceLocation 
  } = useRouteOperations(
    route, 
    setRoute, 
    startLocation, 
    endLocation, 
    availableLocations, 
    setAvailableLocations, 
    vehicleConfig
  );

  // Get save route functionality
  const { handleConfirmLoad } = useSaveRoute(route, setIsLoadConfirmed, selectedVehicle);

  // Get region handling functionality
  const { setRouteRegion } = useRouteRegionHandlers(setRoute);

  // Get route handlers
  const {
    handleStartLocationChange,
    handleEndLocationChange,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
    handleUpdateLocations,
  } = useRouteHandlers(
    route,
    setRoute,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
    availableLocations,
    setAvailableLocations,
    vehicleConfig,
    setIsLoadConfirmed,
    updateVehicleConfig
  );

  return {
    route,
    availableLocations,
    startLocation, 
    endLocation,
    vehicleConfig,
    isLoadConfirmed,
    isSyncingLocations,
    setStartLocation,
    setEndLocation,
    handleStartLocationChange,
    handleEndLocationChange,
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
    handleConfirmLoad,
    handleUpdateLocations,
    replaceLocation,
    setIsLoadConfirmed,
    setAvailableLocations,
    updateVehicleConfig,
    selectedVehicle,
    setSelectedVehicle,
    setRouteRegion
  };
};

export default useRouteManagement;
