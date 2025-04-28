import React, { useEffect } from 'react';
import { useVehiclesData } from '@/hooks/fleet/useVehiclesData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import TruckWeightIndicator from '@/components/reports/TruckWeightIndicator';
import { toast } from 'sonner';
import { Vehicle } from '@/types/fleet';
import { MapPin, Globe } from 'lucide-react';
import { MAX_CYLINDERS, CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight, isRouteOverweight } from '@/utils/route/weightUtils';

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
    country?: string;
    region?: string;
    name?: string;
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
  vehicles?: Vehicle[];
  selectedVehicle?: string | null;
  onVehicleChange?: (vehicleId: string) => void;
  onReplaceLocation?: (index: number, newLocationId: string) => void;
  selectedCountry?: string;
  selectedRegion?: string;
  onRegionChange?: (country: string, region: string) => void;
}

const MAX_PAYLOAD_KG = MAX_CYLINDERS * Math.max(CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG);

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
  vehicles = [],
  selectedVehicle,
  onVehicleChange,
  onReplaceLocation,
  selectedCountry,
  selectedRegion,
  onRegionChange
}) => {
  const startLocationId = startLocation?.id || null;
  const endLocationId = endLocation?.id || null;

  const routeWeight = route.locations && route.locations.length > 0 
    ? calculateTotalWeight(route.locations, startLocationId, endLocationId) 
    : 0;
    
  const isOverweight = routeWeight > MAX_CYLINDERS * CYLINDER_WEIGHT_KG;

  const handleAddLocationToRoute = (location: LocationType & { cylinders: number }) => {
    const simulatedLocations = [...route.locations, location];
    const projectedWeight = calculateTotalWeight(simulatedLocations, startLocationId, endLocationId);
    
    if (projectedWeight > (MAX_CYLINDERS * CYLINDER_WEIGHT_KG)) {
      toast.error(`Weight limit exceeded! Adding this location would exceed the maximum capacity of ${MAX_CYLINDERS * CYLINDER_WEIGHT_KG}kg.`, {
        duration: 5000
      });
      return;
    }
    
    onAddLocationToRoute(location);
  };

  const routeName = route.name || (startLocation && endLocation 
    ? `${startLocation.name} to ${endLocation.name}` 
    : "New Route");

  const routeWithName = {
    ...route,
    name: routeName
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-1 lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-6">
                <h3 className="font-semibold text-lg">Route Map</h3>
                <div className="w-56">
                  <TruckWeightIndicator 
                    totalCylinders={route.cylinders}
                    emptyCylinders={
                      route.locations?.reduce((sum, loc) => sum + (loc.emptyCylinders || 0), 0)
                    }
                    maxCylinders={MAX_CYLINDERS}
                    cylinderWeight={CYLINDER_WEIGHT_KG}
                    locations={route.locations}
                    startLocationId={startLocationId}
                    endLocationId={endLocationId}
                  />
                </div>
              </div>
              {route.region && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                  <Globe className="h-4 w-4" />
                  <span>{route.country} - {route.region}</span>
                </div>
              )}
              {transformedLocations.length > 0 && (
                <Button 
                  variant="default" 
                  onClick={onOptimize}
                  className="gap-2"
                  disabled={route.locations.length < 3 || isOverweight}
                >
                  Optimize Route
                </Button>
              )}
            </div>
            <div>
              <RouteEndpoints
                startLocation={startLocation}
                endLocation={endLocation}
                availableLocations={availableLocations}
                onStartLocationChange={onStartLocationChange}
                onEndLocationChange={onEndLocationChange}
                isLoadingLocations={isSyncingLocations}
                isDisabled={isLoadConfirmed}
                selectedCountry={selectedCountry}
                selectedRegion={selectedRegion}
              />
            </div>
            <div className="h-[400px] mt-4 relative">
              <RouteMap 
                locations={transformedLocations} 
                height="100%" 
                country={route.country}
                region={route.region}
              />
            </div>
            <Separator className="my-4" />
            <LocationSelector
              availableLocations={filteredAvailableLocations}
              onSelectLocation={handleAddLocationToRoute}
              disabled={!startLocation || isLoadConfirmed || isOverweight}
              onUpdateLocations={onUpdateLocations}
            />
            <Separator className="my-4" />
            <OptimizationParameters onOptimize={onOptimize} />
            {vehicles && vehicles.length > 0 && onVehicleChange && (
              <div className="mt-4">
                <VehicleSelector 
                  vehicles={vehicles} 
                  selectedVehicle={selectedVehicle || 'none'} 
                  onVehicleChange={onVehicleChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1">
        <div className="space-y-4">
          <RouteStopsList 
            locations={route.locations} 
            availableLocations={filteredAvailableLocations} 
            onRemoveLocation={onRemoveLocation}
            onAddNewLocation={isOverweight ? () => toast.error("Cannot add more locations: weight limit exceeded") : onAddNewLocation}
            routeMetrics={route.locations.length > 0 ? {
              distance: route.distance,
              duration: route.estimatedDuration || 0,
              fuelCost: route.fuelCost
            } : undefined}
            onReplaceLocation={onReplaceLocation}
          />
          <RouteDetails
            route={routeWithName}
            onRemoveLocation={onRemoveLocation}
            onFuelCostUpdate={onFuelCostUpdate}
            onRouteDataUpdate={onRouteDataUpdate}
            onOptimize={onOptimize}
            onSave={isOverweight ? () => toast.error("Cannot save route: weight limit exceeded") : onConfirmLoad}
            isLoadConfirmed={isLoadConfirmed}
            vehicleConfig={vehicleConfig}
            isOverweight={isOverweight}
            selectedVehicle={selectedVehicle}
            vehicles={vehicles}
            startLocationId={startLocationId}
            endLocationId={endLocationId}
          />
        </div>
      </div>
    </div>
  );
};

const VehicleSelector = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleChange 
}: { 
  vehicles: Vehicle[], 
  selectedVehicle: string, 
  onVehicleChange: (vehicleId: string) => void 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="vehicle-select">Assign Vehicle</Label>
      <Select value={selectedVehicle} onValueChange={onVehicleChange}>
        <SelectTrigger id="vehicle-select">
          <SelectValue placeholder="Select a vehicle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {vehicles
            .filter(vehicle => vehicle.status === 'Available')
            .map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.licensePlate})
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Only available vehicles can be assigned to routes
      </p>
    </div>
  );
};

export default CreateRouteTab;
