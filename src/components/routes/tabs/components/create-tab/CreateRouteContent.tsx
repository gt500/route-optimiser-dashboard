
import React from 'react';
import { useCreateRouteState } from './hooks/useCreateRouteState';
import { RouteTopSection } from './RouteTopSection';
import { RouteMainContent } from './RouteMainContent';
import { RouteBottomNav } from './RouteBottomNav';
import { LocationType } from '@/types/location';
import { VehicleConfigProps } from '@/hooks/routes/types';
import { Vehicle } from '@/types/fleet';

interface CreateRouteContentProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    maintenanceCost: number;
    totalCost: number;
    cylinders: number;
    locations: LocationType[];
    availableLocations: LocationType[];
    trafficConditions: 'light' | 'moderate' | 'heavy';
    estimatedDuration: number;
    country: string;
    region: string;
  };
  isSyncingLocations: boolean;
  isLoadConfirmed: boolean;
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  filteredAvailableLocations: LocationType[];
  transformedLocations: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }[];
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
  vehicleConfig: VehicleConfigProps;
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onVehicleChange: (vehicleId: string) => void;
  onReplaceLocation: (index: number, newLocationId: string) => void;
  selectedCountry: string;
  selectedRegion: string;
  onRegionChange: (country: string, region: string) => void;
}

export const CreateRouteContent: React.FC<CreateRouteContentProps> = ({
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
  vehicleConfig,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  onReplaceLocation,
  selectedCountry,
  selectedRegion,
  onRegionChange
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    isOptimizationPanelVisible, 
    setIsOptimizationPanelVisible,
    getRouteName,
    displayLocations,
    handleOptimizeClick
  } = useCreateRouteState(route, transformedLocations, onOptimize);

  return (
    <div className="space-y-4">
      {/* Top section with endpoints and map */}
      <RouteTopSection 
        availableLocations={availableLocations}
        startLocation={startLocation}
        endLocation={endLocation}
        onStartLocationChange={onStartLocationChange}
        onEndLocationChange={onEndLocationChange}
        isLoadingLocations={isSyncingLocations}
        isDisabled={isLoadConfirmed}
        selectedCountry={selectedCountry}
        selectedRegion={selectedRegion}
        displayLocations={displayLocations}
        onRouteDataUpdate={onRouteDataUpdate}
        getRouteName={getRouteName}
      />

      {/* Main content area with tabs */}
      <RouteMainContent 
        activeTab={activeTab}
        isOptimizationPanelVisible={isOptimizationPanelVisible}
        onClose={() => setIsOptimizationPanelVisible(false)}
        setActiveTab={setActiveTab}
        route={route}
        onFuelCostUpdate={onFuelCostUpdate}
        onOptimize={handleOptimizeClick}
        isLoadConfirmed={isLoadConfirmed}
        onConfirmLoad={onConfirmLoad}
        vehicleConfig={vehicleConfig}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleChange={onVehicleChange}
        filteredAvailableLocations={filteredAvailableLocations}
        availableLocations={availableLocations}
        startLocation={startLocation}
        endLocation={endLocation}
        onStartLocationChange={onStartLocationChange}
        onEndLocationChange={onEndLocationChange}
        onAddLocationToRoute={onAddLocationToRoute}
        routeLocations={route.locations}
        onRemoveLocation={onRemoveLocation}
        onAddNewLocation={onAddNewLocation}
        onReplaceLocation={onReplaceLocation}
        isSyncingLocations={isSyncingLocations}
      />
      
      {/* Bottom navigation buttons */}
      <RouteBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
