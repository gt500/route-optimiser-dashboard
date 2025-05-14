
import React from 'react';
import { CreateRouteContent } from './components/create-tab/CreateRouteContent';
import { RouteState } from '@/hooks/routes/types';
import { LocationType } from '@/types/location';
import { VehicleConfigProps } from '@/hooks/routes/types';
import { Vehicle } from '@/types/fleet';

interface CreateRouteTabProps {
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

const CreateRouteTab: React.FC<CreateRouteTabProps> = (props) => {
  return (
    <CreateRouteContent {...props} />
  );
};

export default CreateRouteTab;
