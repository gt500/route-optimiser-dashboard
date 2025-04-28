
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RouteDetails from '../RouteDetails';
import RouteMap from '../RouteMap';
import RouteLocations from '../RouteLocations';
import { LocationType } from '@/types/location';
import { VehicleConfigProps } from '@/hooks/useRouteManagement';
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
    address?: string;
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

const CreateRouteTab: React.FC<CreateRouteTabProps> = ({
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
  const [activeTab, setActiveTab] = React.useState('details');
  
  // Determine route name based on start and end locations
  const getRouteName = () => {
    if (route.locations.length < 2) return '';
    
    // Check for common route patterns
    const startName = route.locations[0]?.name || '';
    const endName = route.locations[route.locations.length - 1]?.name || '';
    
    if (startName.includes('Afrox') && endName.includes('West Coast')) {
      return 'Cape Town Urban Delivery';
    } else if (startName.includes('Hugo') && endName.includes('Zevenwacht')) {
      return 'Northern Suburbs Route';
    } else if (startName.includes('Stellenbosch') && endName.includes('Simonsrust')) {
      return 'Winelands Delivery';
    }
    
    // Default: combine start and end locations
    return `${startName} to ${endName}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Card className="h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Route Details</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <RouteDetails
                route={route}
                onFuelCostUpdate={onFuelCostUpdate}
                onOptimize={onOptimize}
                isLoadConfirmed={isLoadConfirmed}
                onConfirmLoad={onConfirmLoad}
                vehicleConfig={vehicleConfig}
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onVehicleChange={onVehicleChange}
              />
            </TabsContent>
            <TabsContent value="locations" className="space-y-4">
              <RouteLocations 
                availableLocations={filteredAvailableLocations}
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
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <div>
        <Card className="h-[500px] overflow-hidden">
          <RouteMap 
            locations={transformedLocations}
            className="h-full"
            height="500px"
            onRouteDataUpdate={onRouteDataUpdate}
            showTraffic={true}
            country={selectedCountry}
            region={selectedRegion}
            routeName={getRouteName()}
          />
        </Card>
        <div className="flex justify-between mt-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('details')} 
            className="w-[49%]"
          >
            Edit Route Details
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('locations')} 
            className="w-[49%]"
          >
            Edit Locations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRouteTab;
