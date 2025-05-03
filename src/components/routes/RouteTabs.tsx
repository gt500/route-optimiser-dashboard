
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Vehicle } from '@/types/fleet';
import { RouteState, VehicleConfigProps } from '@/hooks/routes/types';
import RouteTabList from './tabs/components/RouteTabList';
import RouteTabContent from './tabs/components/RouteTabContent';

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

const RouteTabs: React.FC<RouteTabsProps> = (props) => {
  const { 
    activeTab, 
    setActiveTab 
  } = props;

  return (
    <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <RouteTabList activeTab={activeTab} />
      <RouteTabContent {...props} />
    </Tabs>
  );
};

export default RouteTabs;
