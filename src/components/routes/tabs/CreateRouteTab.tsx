
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import RouteEndpoints from '../RouteEndpoints';
import LocationSelector from '../LocationSelector';
import OptimizationParameters from '../OptimizationParameters';
import RouteMap from '../RouteMap';
import RouteDetails from '../RouteDetails';

interface CreateRouteTabProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    availableLocations: LocationType[];
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
  transformedLocations: any[];
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
  onUpdateLocations: (updatedLocations: LocationType[]) => void;
  onOptimize: (params: any) => void;
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate: (distance: number, duration: number) => void;
  onConfirmLoad: () => void;
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
  onConfirmLoad
}) => {
  // Create a wrapper function for onOptimize that matches the expected signature
  const handleOptimize = () => {
    onOptimize({});
  };

  return (
    <div className="space-y-4">
      {isSyncingLocations && (
        <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm flex items-center mb-4">
          Synchronizing locations with database...
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Route Preview</CardTitle>
              <CardDescription>
                {route.usingRealTimeData 
                  ? `Optimized with real-time traffic data (${route.trafficConditions} traffic)`
                  : 'Optimized delivery path with cost calculations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[500px]">
                {route.locations.length > 0 && (
                  <RouteMap 
                    locations={transformedLocations}
                    showRouting={route.locations.length >= 2}
                    startLocation={route.locations[0] ? { 
                      name: route.locations[0].name, 
                      coords: [route.locations[0].lat || 0, route.locations[0].long || 0] 
                    } : undefined}
                    endLocation={route.locations.length > 1 && endLocation ? { 
                      name: route.locations[route.locations.length - 1].name, 
                      coords: [
                        route.locations[route.locations.length - 1].lat || 0, 
                        route.locations[route.locations.length - 1].long || 0
                      ] 
                    } : undefined}
                    waypoints={route.locations.slice(1, endLocation ? -1 : undefined).map(loc => ({
                      name: loc.name,
                      coords: [loc.lat || 0, loc.long || 0]
                    }))}
                    height="100%"
                    forceRouteUpdate={isLoadConfirmed}
                    onRouteDataUpdate={onRouteDataUpdate}
                  />
                )}
              </div>
              
              <RouteDetails 
                route={route} 
                onRemoveLocation={onRemoveLocation} 
                onAddNewLocation={onAddNewLocation}
                onFuelCostUpdate={onFuelCostUpdate}
                onRouteDataUpdate={onRouteDataUpdate}
                onOptimize={handleOptimize}
                onSave={onConfirmLoad}
                isLoadConfirmed={isLoadConfirmed}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={onConfirmLoad} 
                  className="bg-green-500 hover:bg-green-600" 
                  disabled={isLoadConfirmed || route.locations.length < 2}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> 
                  {isLoadConfirmed ? 'Load Confirmed' : 'Confirm Load'}
                </Button>
              </div>
              
              {isLoadConfirmed && (
                <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> 
                  Load confirmed and saved for this date
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <RouteEndpoints
            availableLocations={availableLocations}
            startLocation={startLocation}
            endLocation={endLocation}
            onStartLocationChange={onStartLocationChange}
            onEndLocationChange={onEndLocationChange}
          />
          <LocationSelector 
            onAdd={onAddLocationToRoute} 
            availableLocations={filteredAvailableLocations}
            onUpdateLocations={onUpdateLocations}
          />
          <OptimizationParameters onOptimize={onOptimize} />
        </div>
      </div>
    </div>
  );
};

export default CreateRouteTab;
