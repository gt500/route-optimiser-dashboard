import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MapPin, Globe } from 'lucide-react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import CreateRouteTab from '@/components/routes/tabs/CreateRouteTab';
import ActiveRoutesTab from '@/components/routes/tabs/ActiveRoutesTab';
import RouteHistoryTab from '@/components/routes/tabs/RouteHistoryTab';
import useRouteManagement, { defaultVehicleConfig } from '@/hooks/useRouteManagement';
import { routeOptimizationDefaultParams } from '@/hooks/useRouteManagement';
import { toast } from 'sonner';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import RegionSelectionDialog from '@/components/routes/RegionSelectionDialog';

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
  const [activeTab, setActiveTab] = useState('create');
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
    handleReplaceLocation,
    setAvailableLocations,
    setRouteRegion
  } = useRouteManagement(initialLocations);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (activeTab === 'create' && !isLoadConfirmed && !selectedCountry) {
      setRegionSelectionOpen(true);
    }
  }, [activeTab, isLoadConfirmed]);

  const filteredAvailableLocations = useMemo(() => {
    return availableLocations.filter(loc => 
      loc.id !== startLocation?.id && 
      loc.id !== endLocation?.id &&
      !route.locations.some(routeLoc => routeLoc.id === loc.id)
    );
  }, [availableLocations, startLocation, endLocation, route.locations]);

  const transformedLocations = useMemo(() => {
    return route.locations.map(loc => ({
      id: loc.id.toString(),
      name: loc.name,
      latitude: loc.lat,
      longitude: loc.long,
      address: loc.address || '',
    }));
  }, [route.locations]);

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
    setSelectedCountry(country);
    setSelectedRegion(region);
    setRouteRegion(country, region);
    toast.success(`Selected region: ${region}, ${country}`);
  };

  const handleCreateRoute = () => {
    handleCreateNewRoute();
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
      handleReplaceLocation(oldLocationId, newLocationId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/0b09ba82-e3f0-4fa1-ab8d-87f06fd9f31b.png" 
            alt="GAZ2GO" 
            className="h-12 w-auto" 
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Route Optimiser</h1>
            <p className="text-muted-foreground">Create and manage delivery routes in South Africa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={addNewLocation}>
            <MapPin className="h-4 w-4" />
            New Location
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setRegionSelectionOpen(true)}>
            <Globe className="h-4 w-4" />
            Change Region
          </Button>
          <Button className="gap-1" onClick={handleCreateRoute}>
            <Plus className="h-4 w-4" />
            New Route
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="create">Create Route</TabsTrigger>
          <TabsTrigger value="active">Active Routes</TabsTrigger>
          <TabsTrigger value="history">Route History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <CreateRouteTab
            route={{
              ...route,
              country: selectedCountry,
              region: selectedRegion
            }}
            isSyncingLocations={isSyncingLocations}
            isLoadConfirmed={isLoadConfirmed}
            availableLocations={availableLocations}
            startLocation={startLocation}
            endLocation={endLocation}
            filteredAvailableLocations={filteredAvailableLocations}
            transformedLocations={transformedLocations}
            onStartLocationChange={handleStartLocationChange}
            onEndLocationChange={handleEndLocationChange}
            onAddLocationToRoute={addLocationToRoute}
            onUpdateLocations={handleUpdateLocations}
            onOptimize={handleOptimizeRoute}
            onRemoveLocation={handleRemoveLocation}
            onAddNewLocation={handleAddNewLocationFromPopover}
            onFuelCostUpdate={handleFuelCostUpdate}
            onRouteDataUpdate={handleRouteDataUpdate}
            onConfirmLoad={handleConfirmLoad}
            vehicleConfig={vehicleConfig || defaultVehicleConfig}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onVehicleChange={handleVehicleChange}
            onReplaceLocation={handleReplaceLocation}
            selectedCountry={selectedCountry}
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <ActiveRoutesTab onCreateRoute={() => setActiveTab('create')} />
        </TabsContent>
        
        <TabsContent value="history">
          <RouteHistoryTab onCreateRoute={() => setActiveTab('create')} />
        </TabsContent>
      </Tabs>

      <LocationEditDialog 
        open={newLocationDialog}
        onOpenChange={setNewLocationDialog}
        location={null}
        onSave={handleSaveNewLocation}
      />

      <RegionSelectionDialog
        open={regionSelectionOpen}
        onOpenChange={setRegionSelectionOpen}
        onComplete={handleRegionChange}
      />
    </div>
  );
};

export default RoutesList;
