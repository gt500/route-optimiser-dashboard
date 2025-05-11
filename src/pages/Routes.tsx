
import React, { useState, useMemo, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import useRouteManagement, { defaultVehicleConfig } from '@/hooks/useRouteManagement';
import { routeOptimizationDefaultParams } from '@/hooks/useRouteManagement';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';

// Import new components and hooks
import RouteHeader from '@/components/routes/RouteHeader';
import RouteTabs from '@/components/routes/RouteTabs';
import RouteInitialLocation from '@/components/routes/RouteInitialLocation';
import RegionSelectionAlertDialog from '@/components/routes/RegionSelectionAlertDialog';
import RouteActionButtons from '@/components/routes/RouteActionButtons';
import RouteHeaderTitle from '@/components/routes/RouteHeaderTitle';
import { useRegionSelection } from '@/hooks/routes/useRegionSelection';
import { useLocationManagement } from '@/hooks/routes/useLocationManagement';
import { useRoutePageState } from '@/hooks/routes/useRoutePageState';

// Import initial locations from a separate file
import { initialRouteLocations } from '@/data/initialRouteLocations';

const RoutesList = () => {
  // Initialize region selection
  const defaultRegions = getStoredCountryRegions();
  const defaultCountry = defaultRegions.length > 0 ? defaultRegions[0].country : 'South Africa';
  const defaultRegion = defaultRegions.length > 0 && defaultRegions[0].regions.length > 0 
    ? defaultRegions[0].regions[0] 
    : 'Western Cape';

  const { vehicles, fetchVehicles } = useVehiclesData();

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

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
  
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
      : `Vehicle assigned: ${vehicles.find(v => v.id === vehicleId)?.name}`);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <RouteHeaderTitle />
        <RouteActionButtons 
          onAddNewLocation={addNewLocation}
          onOpenRegionSelection={openRegionSelection}
          onCreateNewRoute={handleCreateRoute}
          onOptimize={handleOptimizeRoute}
          onConfirmLoad={handleConfirmLoad}
          isLoadConfirmed={isLoadConfirmed}
          isOptimizeDisabled={isOptimizeDisabled}
        />
      </div>

      {/* Tabs component */}
      <RouteTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        route={route}
        availableLocations={availableLocations}
        startLocation={startLocation}
        endLocation={endLocation}
        filteredAvailableLocations={filteredAvailableLocations}
        transformedLocations={transformedLocations}
        onStartLocationChange={handleStartLocationChange}
        onEndLocationChange={handleEndLocationChange}
        onAddLocationToRoute={addLocationToRoute}
        onRemoveLocation={handleRemoveLocation}
        onAddNewLocation={handleAddNewLocationFromPopover}
        onOptimize={handleOptimizeRoute}
        onUpdateLocations={handleUpdateLocations}
        onFuelCostUpdate={handleFuelCostUpdate}
        onRouteDataUpdate={handleRouteDataUpdate}
        onConfirmLoad={handleConfirmLoad}
        onReplaceLocation={handleReplaceLocation}
        isLoadConfirmed={isLoadConfirmed}
        isSyncingLocations={isSyncingLocations}
        vehicleConfig={vehicleConfig || defaultVehicleConfig}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        highlightedDeliveryId={highlightedDeliveryId}
        selectedCountry={selectedCountry}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
      />

      {/* Dialogs */}
      <LocationEditDialog 
        open={newLocationDialog}
        onOpenChange={setNewLocationDialog}
        location={null}
        onSave={handleSaveNewLocation}
      />

      {/* Use both dialog implementations for redundancy */}
      <RouteInitialLocation
        activeTab={activeTab}
        isLoadConfirmed={isLoadConfirmed}
        regionSelectionOpen={regionSelectionOpen}
        setRegionSelectionOpen={setRegionSelectionOpen}
        onRegionChange={handleRegionChange}
      />
      
      {/* Alternative AlertDialog implementation for more reliable closing */}
      <RegionSelectionAlertDialog
        open={regionSelectionOpen}
        onOpenChange={setRegionSelectionOpen}
        onComplete={handleRegionChange}
      />
    </div>
  );
};

export default RoutesList;
