
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateRouteTab from './tabs/CreateRouteTab';
import ActiveRoutesTab from './tabs/ActiveRoutesTab';
import RouteHistoryTab from './tabs/RouteHistoryTab';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Vehicle } from '@/types/fleet';
import { RouteState, VehicleConfigProps } from '@/hooks/routes/types';

interface RouteTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  route: RouteState;
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  filteredAvailableLocations: LocationType[];
  transformedLocations: any[];
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
  onOptimize: () => void;
  onUpdateLocations: (locations: LocationType[]) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate: (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => void;
  onConfirmLoad: () => void;
  onReplaceLocation: (index: number, newLocationId: string) => void;
  isLoadConfirmed: boolean;
  isSyncingLocations: boolean;
  vehicleConfig: VehicleConfigProps;
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onVehicleChange: (vehicleId: string) => void;
  highlightedDeliveryId: string | null;
  selectedCountry: string;
  selectedRegion: string;
  onRegionChange: (country: string, region: string) => void;
}

const RouteTabs: React.FC<RouteTabsProps> = ({
  activeTab,
  setActiveTab,
  route,
  availableLocations,
  startLocation,
  endLocation,
  filteredAvailableLocations,
  transformedLocations,
  onStartLocationChange,
  onEndLocationChange,
  onAddLocationToRoute,
  onRemoveLocation,
  onAddNewLocation,
  onOptimize,
  onUpdateLocations,
  onFuelCostUpdate,
  onRouteDataUpdate,
  onConfirmLoad,
  onReplaceLocation,
  isLoadConfirmed,
  isSyncingLocations,
  vehicleConfig,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  highlightedDeliveryId,
  selectedCountry,
  selectedRegion,
  onRegionChange
}) => {
  return (
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
          onStartLocationChange={onStartLocationChange}
          onEndLocationChange={onEndLocationChange}
          onAddLocationToRoute={onAddLocationToRoute}
          onUpdateLocations={onUpdateLocations}
          onOptimize={onOptimize}
          onRemoveLocation={onRemoveLocation}
          onAddNewLocation={onAddNewLocation}
          onFuelCostUpdate={onFuelCostUpdate}
          onRouteDataUpdate={onRouteDataUpdate}
          onConfirmLoad={onConfirmLoad}
          vehicleConfig={vehicleConfig}
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onVehicleChange={onVehicleChange}
          onReplaceLocation={onReplaceLocation}
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange}
        />
      </TabsContent>
      
      <TabsContent value="active">
        <ActiveRoutesTab 
          onCreateRoute={() => setActiveTab('create')} 
          highlightedDeliveryId={highlightedDeliveryId}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <RouteHistoryTab onCreateRoute={() => setActiveTab('create')} />
      </TabsContent>
    </Tabs>
  );
};

export default RouteTabs;
