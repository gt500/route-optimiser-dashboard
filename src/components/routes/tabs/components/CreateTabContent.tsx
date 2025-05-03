
import React from 'react';
import CreateRouteTab from '../CreateRouteTab';
import { LocationType } from '@/types/location';
import { Vehicle } from '@/types/fleet';
import { VehicleConfigProps, RouteState } from '@/hooks/routes/types';

interface CreateTabContentProps {
  route: RouteState;
  isSyncingLocations: boolean;
  isLoadConfirmed: boolean;
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
  vehicleConfig: VehicleConfigProps;
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onVehicleChange: (vehicleId: string) => void;
  selectedCountry: string;
  selectedRegion: string;
  onRegionChange: (country: string, region: string) => void;
}

const CreateTabContent: React.FC<CreateTabContentProps> = ({
  route,
  isSyncingLocations,
  isLoadConfirmed,
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
  vehicleConfig,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  selectedCountry,
  selectedRegion,
  onRegionChange
}) => {
  return (
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
  );
};

export default CreateTabContent;
