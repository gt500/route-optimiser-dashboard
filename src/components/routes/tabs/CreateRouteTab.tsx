
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RouteMap from "@/components/routes/RouteMap";
import LocationSelector from "@/components/routes/LocationSelector";
import RouteEndpoints from "@/components/routes/RouteEndpoints";
import OptimizationParameters from "@/components/routes/OptimizationParameters";
import RouteStopsList from "@/components/routes/stops/RouteStopsList";
import RouteDetails from "@/components/routes/RouteDetails";
import { LocationType } from "@/components/locations/LocationEditDialog";
import { VehicleConfigProps } from '@/hooks/useRouteManagement';

interface CreateRouteTabProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy';
    usingRealTimeData?: boolean;
  };
  isSyncingLocations: boolean;
  isLoadConfirmed: boolean;
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  filteredAvailableLocations: LocationType[];
  transformedLocations: { id: string; name: string; latitude: number; longitude: number; address: string; }[];
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
  onUpdateLocations: (locations: LocationType[]) => void;
  onOptimize: () => void;
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate: (distance: number, duration: number) => void;
  onConfirmLoad: () => void;
  vehicleConfig: VehicleConfigProps;
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
  vehicleConfig
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-1 lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Route Map</h3>
              {transformedLocations.length > 0 && (
                <Button 
                  variant="default" 
                  onClick={onOptimize}
                  className="gap-2"
                  disabled={route.locations.length < 3}
                >
                  Optimize Route
                </Button>
              )}
            </div>
            <div>
              <RouteEndpoints
                startLocation={startLocation}
                endLocation={endLocation}
                locations={availableLocations}
                onStartLocationChange={onStartLocationChange}
                onEndLocationChange={onEndLocationChange}
                isLoadingLocations={isSyncingLocations}
                isDisabled={isLoadConfirmed}
              />
            </div>
            <div className="h-[400px] mt-4 relative">
              <RouteMap locations={transformedLocations} height="100%" />
            </div>
            <Separator className="my-4" />
            <LocationSelector
              locations={filteredAvailableLocations}
              onSelectLocation={onAddLocationToRoute}
              disabled={!startLocation || isLoadConfirmed}
            />
            <Separator className="my-4" />
            <OptimizationParameters />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1">
        <div className="space-y-4">
          <RouteStopsList 
            locations={route.locations} 
            availableLocations={filteredAvailableLocations} 
            onRemoveLocation={onRemoveLocation}
            onAddNewLocation={onAddNewLocation}
            routeMetrics={route.locations.length > 0 ? {
              distance: route.distance,
              duration: route.estimatedDuration || 0,
              fuelCost: route.fuelCost
            } : undefined}
          />
          <RouteDetails
            route={route}
            onRemoveLocation={onRemoveLocation}
            onFuelCostUpdate={onFuelCostUpdate}
            onRouteDataUpdate={onRouteDataUpdate}
            onOptimize={onOptimize}
            onSave={onConfirmLoad}
            isLoadConfirmed={isLoadConfirmed}
            vehicleConfig={vehicleConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateRouteTab;
