
import { useState, useMemo, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import useRouteManagement, { routeOptimizationDefaultParams } from '@/hooks/useRouteManagement';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';
import { useRegionSelection } from '@/hooks/routes/useRegionSelection';
import { useLocationManagement } from '@/hooks/routes/useLocationManagement';
import { useRoutePageState } from '@/hooks/routes/useRoutePageState';

export const useRoutePageContainer = (initialRouteLocations: LocationType[] = []) => {
  // Initialize region selection
  const defaultRegions = getStoredCountryRegions();
  const defaultCountry = defaultRegions.length > 0 ? defaultRegions[0].country : 'South Africa';
  const defaultRegion = defaultRegions.length > 0 && defaultRegions[0].regions.length > 0 
    ? defaultRegions[0].regions[0] 
    : 'Western Cape';

  const {
    route,
    availableLocations,
    startLocation,
    endLocation,
    isLoadConfirmed,
    isSyncingLocations,
    vehicleConfig,
    selectedVehicle,
    setSelectedVehicle,
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
    setAvailableLocations,
    setRouteRegion
  } = useRouteManagement(initialRouteLocations);

  // Initialize region selection hook
  const { 
    selectedCountry,
    selectedRegion,
    regionSelectionOpen,
    setRegionSelectionOpen,
    handleRegionChange,
    openRegionSelection
  } = useRegionSelection(defaultCountry, defaultRegion);

  // Location management hook
  const {
    newLocationDialog,
    setNewLocationDialog,
    addNewLocation,
    handleSaveNewLocation
  } = useLocationManagement(
    availableLocations,
    setAvailableLocations,
    handleUpdateLocations,
    selectedCountry,
    selectedRegion
  );

  // Route page state management
  const { 
    activeTab, 
    setActiveTab,
    highlightedDeliveryId,
    handleOptimizeRoute,
    isOptimizeDisabled
  } = useRoutePageState(
    initialRouteLocations,
    () => handleOptimize(routeOptimizationDefaultParams),
    handleConfirmLoad,
    handleCreateNewRoute,
    isLoadConfirmed,
    route
  );
  
  // Initialize route with default region if available
  useEffect(() => {
    if (!route.country && !route.region && selectedCountry && selectedRegion) {
      console.log("Setting initial route region:", selectedCountry, selectedRegion);
      setRouteRegion(selectedCountry, selectedRegion);
    }
  }, [route.country, route.region, selectedCountry, selectedRegion, setRouteRegion]);

  // Filter locations for availability
  const filteredAvailableLocations = useMemo(() => {
    return availableLocations.filter(loc => 
      loc.id !== startLocation?.id && 
      loc.id !== endLocation?.id &&
      !route.locations.some(routeLoc => routeLoc.id === loc.id)
    );
  }, [availableLocations, startLocation, endLocation, route.locations]);

  // Transform locations for map display
  const transformedLocations = useMemo(() => {
    return route.locations.map(loc => ({
      id: loc.id.toString(),
      name: loc.name,
      latitude: loc.lat,
      longitude: loc.long,
      address: loc.address || '',
    }));
  }, [route.locations]);

  // Handler functions
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId === "" ? null : vehicleId);
    toast.success(vehicleId === "" 
      ? "Vehicle assignment removed" 
      : `Vehicle assigned`);
  };

  const handleCreateRoute = () => {
    handleCreateNewRoute();
    console.log("Opening region selection dialog from handleCreateRoute");
    // Set a delay to ensure the state has been updated before opening the dialog
    setTimeout(() => {
      setRegionSelectionOpen(true);
    }, 100);
  };

  const handleRemoveLocation = (index: number) => {
    const locationId = route.locations[index]?.id;
    if (locationId) {
      removeLocationFromRoute(locationId);
    }
  };

  const handleReplaceLocation = (index: number, newLocationId: string) => {
    const oldLocationId = route.locations[index]?.id;
    if (oldLocationId) {
      replaceLocation(oldLocationId, newLocationId);
    }
  };

  return {
    // State
    route,
    availableLocations,
    startLocation,
    endLocation,
    isLoadConfirmed,
    isSyncingLocations,
    vehicleConfig,
    selectedVehicle,
    filteredAvailableLocations,
    transformedLocations,
    activeTab,
    regionSelectionOpen,
    newLocationDialog,
    highlightedDeliveryId,
    isOptimizeDisabled,
    selectedCountry,
    selectedRegion,
    
    // Setters
    setActiveTab,
    setSelectedVehicle,
    setNewLocationDialog,
    setRegionSelectionOpen,
    
    // Handlers
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
    handleSaveNewLocation,
    handleRegionChange,
    openRegionSelection,
    handleVehicleChange,
    handleCreateRoute,
    handleRemoveLocation,
    handleReplaceLocation,
    handleOptimizeRoute
  };
};
