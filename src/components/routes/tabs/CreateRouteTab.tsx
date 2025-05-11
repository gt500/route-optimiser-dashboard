import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RouteDetails from '../RouteDetails';
import RouteMap from '../RouteMap';
import RouteLocations from '../RouteLocations';
import { LocationType, LocationInfo } from '@/types/location';
import { VehicleConfigProps } from '@/hooks/routes/types';
import { Vehicle } from '@/types/fleet';
import RouteEndpoints from '../RouteEndpoints';
import RouteOptimizationPanel from '../RouteOptimizationPanel';
import { Button } from '@/components/ui/button'; // Added this import to fix the error

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
    address: string; // Changed from optional to required to match LocationInfo
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
  transformedLocations: propTransformedLocations, // Renamed prop to avoid conflict
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
  const [isOptimizationPanelVisible, setIsOptimizationPanelVisible] = React.useState(false);
  
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

  // Transform locations to ensure they match the LocationInfo interface
  const computedLocations = useMemo(() => {
    return route.locations.map(loc => ({
      id: loc.id.toString(),
      name: loc.name,
      latitude: loc.lat,
      longitude: loc.long,
      address: loc.address || '', // Provide empty string as default for address
    }));
  }, [route.locations]);

  // Use the provided transformed locations from props, or fall back to computed ones
  // Make sure all locations have the required address field
  const displayLocations: LocationInfo[] = useMemo(() => {
    const baseLocations = propTransformedLocations || computedLocations;
    return baseLocations.map(loc => ({
      ...loc,
      address: loc.address || ''  // Ensure address is always present
    }));
  }, [propTransformedLocations, computedLocations]);

  const handleOptimizeClick = () => {
    setIsOptimizationPanelVisible(true);
    onOptimize();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <RouteEndpoints
            availableLocations={availableLocations}
            startLocation={startLocation}
            endLocation={endLocation}
            onStartLocationChange={onStartLocationChange}
            onEndLocationChange={onEndLocationChange}
            isLoadingLocations={isSyncingLocations}
            isDisabled={isLoadConfirmed}
            selectedCountry={selectedCountry}
            selectedRegion={selectedRegion}
          />
        </div>

        <div className="md:col-span-2">
          <Card className="h-full overflow-hidden">
            <RouteMap 
              locations={displayLocations}
              className="h-full"
              height="250px"
              onRouteDataUpdate={onRouteDataUpdate}
              showTraffic={true}
              country={selectedCountry}
              region={selectedRegion}
              routeName={getRouteName()}
              showStopMetrics={true}
            />
          </Card>
        </div>
      </div>

      {/* Main content area with single map display */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="h-full">
          {isOptimizationPanelVisible ? (
            <RouteOptimizationPanel 
              route={route}
              onClose={() => setIsOptimizationPanelVisible(false)}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Route Details</TabsTrigger>
                <TabsTrigger value="stops">Route Stops</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 p-4">
                <RouteDetails
                  route={route}
                  onFuelCostUpdate={onFuelCostUpdate}
                  onOptimize={handleOptimizeClick}
                  isLoadConfirmed={isLoadConfirmed}
                  onConfirmLoad={onConfirmLoad}
                  vehicleConfig={vehicleConfig}
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onVehicleChange={onVehicleChange}
                  hideEndpoints={true}
                />
              </TabsContent>
              
              <TabsContent value="stops" className="space-y-4">
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
                  allowSameStartEndLocation={true}
                  hideEndpoints={true}
                />
              </TabsContent>
            </Tabs>
          )}
        </Card>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('details')} 
            className={`w-[49%] ${activeTab === 'details' ? 'bg-primary/10' : ''}`}
          >
            Route Details
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('stops')} 
            className={`w-[49%] ${activeTab === 'stops' ? 'bg-primary/10' : ''}`}
          >
            Route Stops
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRouteTab;
