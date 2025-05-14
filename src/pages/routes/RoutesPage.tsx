
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import LocationEditDialog from '@/components/locations/LocationEditDialog';

// Import components created in this refactoring
import RouteHeader from './components/RouteHeader';
import RouteTabs from '@/components/routes/RouteTabs'; // Using existing component
import RouteInitialLocation from '@/components/routes/RouteInitialLocation'; // Using existing component
import RegionSelectionAlertDialog from '@/components/routes/RegionSelectionAlertDialog'; // Using existing component
import RouteActionButtons from '@/components/routes/RouteActionButtons'; // Using existing component

// Import initial locations from a separate file
import { initialRouteLocations } from '@/data/initialRouteLocations';

// Import hooks
import { useRoutePageContainer } from './hooks/useRoutePageContainer';

const RoutesPage = () => {
  const { 
    vehicles, 
    fetchVehicles 
  } = useVehiclesData();

  const {
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
    
    // Handlers
    setActiveTab,
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
    setNewLocationDialog,
    handleSaveNewLocation,
    handleRegionChange,
    setRegionSelectionOpen,
    openRegionSelection,
    handleVehicleChange,
    handleCreateRoute,
    handleRemoveLocation,
    handleReplaceLocation,
    handleOptimizeRoute
  } = useRoutePageContainer(initialRouteLocations);

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <RouteHeader 
        onAddNewLocation={() => setNewLocationDialog(true)}
        onOpenRegionSelection={openRegionSelection}
        onCreateNewRoute={handleCreateRoute}
        onOptimize={handleOptimizeRoute}
        onConfirmLoad={handleConfirmLoad}
        isLoadConfirmed={isLoadConfirmed}
        isOptimizeDisabled={isOptimizeDisabled}
      />

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
        vehicleConfig={vehicleConfig}
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

export default RoutesPage;
