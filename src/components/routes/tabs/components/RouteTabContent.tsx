
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CreateTabContent from './CreateTabContent';
import ActiveTabContent from './ActiveTabContent';
import HistoryTabContent from './HistoryTabContent';
import { LocationType } from '@/types/location';
import { Vehicle } from '@/types/fleet';
import { RouteState, VehicleConfigProps } from '@/hooks/routes/types';

interface RouteTabContentProps {
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
  onUpdateLocations: (locations: LocationType[]) => void;
  onOptimize: () => void;
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
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

const RouteTabContent: React.FC<RouteTabContentProps> = ({
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
  onUpdateLocations,
  onOptimize,
  onRemoveLocation,
  onAddNewLocation,
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
    <>
      <TabsContent value="create" className="space-y-4">
        <CreateTabContent
          route={route}
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
          onReplaceLocation={onReplaceLocation}
          vehicleConfig={vehicleConfig}
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onVehicleChange={onVehicleChange}
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange}
        />
      </TabsContent>
      
      <TabsContent value="active">
        <ActiveTabContent 
          onCreateRoute={() => setActiveTab('create')}
          highlightedDeliveryId={highlightedDeliveryId}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <HistoryTabContent onCreateRoute={() => setActiveTab('create')} />
      </TabsContent>
    </>
  );
};

export default RouteTabContent;
