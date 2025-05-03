
import React, { useState, useMemo, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import { useLocation } from 'react-router-dom';
import useRouteManagement, { defaultVehicleConfig } from '@/hooks/useRouteManagement';
import { routeOptimizationDefaultParams } from '@/hooks/useRouteManagement';
import RouteHeader from '@/components/routes/RouteHeader';
import RouteTabs from '@/components/routes/RouteTabs';
import RouteInitialLocation from '@/components/routes/RouteInitialLocation';

const initialLocations: LocationType[] = [
  { id: "1", name: 'Afrox Epping Depot', address: 'Epping Industria, Cape Town', lat: -33.93631, long: 18.52759, type: 'Storage', fullCylinders: 100, emptyCylinders: 0 },
  { id: "5", name: 'Pick n Pay TableView', address: 'Table View, Cape Town', lat: -33.8258, long: 18.4881, type: 'Customer', fullCylinders: 0, emptyCylinders: 18 },
  { id: "6", name: 'SUPERSPAR Parklands', address: 'Parklands, Cape Town', lat: -33.815781, long: 18.495968, type: 'Customer', fullCylinders: 0, emptyCylinders: 12 },
  { id: "7", name: 'West Coast Village', address: 'West Coast, Cape Town', lat: -33.803329, long: 18.485944, type: 'Customer', fullCylinders: 0, emptyCylinders: 16 },
  { id: "8", name: 'KWIKSPAR Paarl', address: 'Paarl, Western Cape', lat: -33.708061, long: 18.962563, type: 'Customer', fullCylinders: 0, emptyCylinders: 10 },
  { id: "9", name: 'SUPERSPAR Plattekloof', address: 'Plattekloof, Cape Town', lat: -33.873642, long: 18.578856, type: 'Customer', fullCylinders: 0, emptyCylinders: 14 },
  { id: "10", name: 'OK Foods Strand', address: 'Strand, Western Cape', lat: -34.12169719, long: 18.836937, type: 'Customer', fullCylinders: 0, emptyCylinders: 9 },
  { id: "11", name: 'OK Urban Sonstraal', address: 'Sonstraal, Western Cape', lat: -33.511, long: 18.3945, type: 'Customer', fullCylinders: 0, emptyCylinders: 11 },
  { id: "12", name: 'Clara Anna', address: 'Clara Anna, Western Cape', lat: -33.818184, long: 18.632576, type: 'Customer', fullCylinders: 0, emptyCylinders: 7 },
  { id: "13", name: 'Laborie', address: 'Laborie, Western Cape', lat: -33.764587, long: 18.960768, type: 'Customer', fullCylinders: 0, emptyCylinders: 13 },
  { id: "14", name: 'Burgundy Square', address: 'Burgundy, Cape Town', lat: -33.841858, long: 18.545229, type: 'Customer', fullCylinders: 0, emptyCylinders: 15 },
  { id: "15", name: 'Shell Sea Point', address: 'Sea Point, Cape Town', lat: -33.4812, long: 18.3855, type: 'Storage', fullCylinders: 75, emptyCylinders: 0 },
  { id: "16", name: 'Shell Hugo Street', address: 'Hugo Street, Cape Town', lat: -33.900848, long: 18.564976, type: 'Storage', fullCylinders: 80, emptyCylinders: 0 },
  { id: "17", name: 'Shell Meadowridge', address: 'Meadowridge, Cape Town', lat: -34.038963, long: 18.455086, type: 'Storage', fullCylinders: 65, emptyCylinders: 0 },
  { id: "18", name: 'Simonsrust Shopping Centre', address: 'Simonsrust, Western Cape', lat: -33.926464, long: 18.877136, type: 'Customer', fullCylinders: 0, emptyCylinders: 19 },
  { id: "19", name: 'Shell Stellenbosch Square', address: 'Stellenbosch, Western Cape', lat: -33.976185, long: 18.843523, type: 'Storage', fullCylinders: 70, emptyCylinders: 0 },
  { id: "20", name: 'Willowridge Shopping Centre', address: 'Willowridge, Western Cape', lat: -33.871166, long: 18.63283, type: 'Customer', fullCylinders: 0, emptyCylinders: 17 },
  { id: "21", name: 'Zevenwacht', address: 'Zevenwacht, Western Cape', lat: -33.949867, long: 18.696407, type: 'Customer', fullCylinders: 0, emptyCylinders: 21 },
  { id: "22", name: 'Killarney Shell', address: 'Killarney, Cape Town', lat: -33.854279, long: 18.516291, type: 'Storage', fullCylinders: 85, emptyCylinders: 0 }
];

const RoutesList = () => {
  const location = useLocation();
  const locationState = location.state as { activeTab?: string; highlightDelivery?: string } | null;
  
  const [activeTab, setActiveTab] = useState(locationState?.activeTab || 'create');
  const [highlightedDeliveryId, setHighlightedDeliveryId] = useState<string | null>(
    locationState?.highlightDelivery || null
  );
  const [newLocationDialog, setNewLocationDialog] = useState(false);
  const [regionSelectionOpen, setRegionSelectionOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  
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
  } = useRouteManagement(initialLocations);

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Handle URL state updates
  useEffect(() => {
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
    
    if (locationState?.highlightDelivery) {
      setHighlightedDeliveryId(locationState.highlightDelivery);
    }
  }, [location, locationState]);

  // Auto-clear the highlight after timeout
  useEffect(() => {
    if (highlightedDeliveryId) {
      const timer = setTimeout(() => {
        setHighlightedDeliveryId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedDeliveryId]);

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
  const addNewLocation = () => {
    setNewLocationDialog(true);
  };

  const handleSaveNewLocation = async (location: LocationType) => {
    const newLocationId = crypto.randomUUID();
    
    const newLocation = {
      ...location,
      id: newLocationId,
      country: selectedCountry,
      region: selectedRegion
    };
    
    const updatedLocations = [...availableLocations, newLocation];
    setAvailableLocations(updatedLocations);
    handleUpdateLocations(updatedLocations);
    toast.success(`Added new location: ${location.name}`);
  };
  
  const handleOptimizeRoute = () => {
    handleOptimize(routeOptimizationDefaultParams);
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId === "" ? null : vehicleId);
    toast.success(vehicleId === "" 
      ? "Vehicle assignment removed" 
      : `Vehicle assigned: ${vehicles.find(v => v.id === vehicleId)?.name}`);
  };

  const handleRegionChange = (country: string, region: string) => {
    console.log("Region changed in RoutesList:", country, region);
    setSelectedCountry(country);
    setSelectedRegion(region);
    setRouteRegion(country, region);
    toast.success(`Selected region: ${region}, ${country}`);
    setRegionSelectionOpen(false); // Explicitly close the dialog
  };

  const handleCreateRoute = () => {
    handleCreateNewRoute();
    console.log("Opening region selection dialog from handleCreateRoute");
    setRegionSelectionOpen(true);
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
      {/* Header component */}
      <RouteHeader
        onAddNewLocation={addNewLocation}
        onOpenRegionSelection={() => {
          console.log("Opening region selection from header button");
          setRegionSelectionOpen(true);
        }}
        onCreateNewRoute={handleCreateRoute}
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

      <RouteInitialLocation
        activeTab={activeTab}
        isLoadConfirmed={isLoadConfirmed}
        regionSelectionOpen={regionSelectionOpen}
        setRegionSelectionOpen={setRegionSelectionOpen}
        onRegionChange={handleRegionChange}
      />
    </div>
  );
};

export default RoutesList;
