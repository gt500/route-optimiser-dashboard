
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RouteDetails from '@/components/routes/RouteDetails';
import RouteLocations from '@/components/routes/RouteLocations';
import RouteOptimizationPanel from '@/components/routes/RouteOptimizationPanel';
import { LocationType } from '@/types/location';
import { VehicleConfigProps } from '@/hooks/routes/types';
import { Vehicle } from '@/types/fleet';

interface RouteMainContentProps {
  activeTab: string;
  isOptimizationPanelVisible: boolean;
  onClose: () => void;
  setActiveTab: (value: string) => void;
  route: any;
  onFuelCostUpdate: (newCost: number) => void;
  onOptimize: () => void;
  isLoadConfirmed: boolean;
  onConfirmLoad: () => void;
  vehicleConfig: VehicleConfigProps;
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onVehicleChange: (vehicleId: string) => void;
  filteredAvailableLocations: LocationType[];
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
  routeLocations: LocationType[];
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
  onReplaceLocation: (index: number, newLocationId: string) => void;
  isSyncingLocations: boolean;
}

export const RouteMainContent: React.FC<RouteMainContentProps> = ({
  activeTab,
  isOptimizationPanelVisible,
  onClose,
  setActiveTab,
  route,
  onFuelCostUpdate,
  onOptimize,
  isLoadConfirmed,
  onConfirmLoad,
  vehicleConfig,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  filteredAvailableLocations,
  availableLocations,
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  onAddLocationToRoute,
  routeLocations,
  onRemoveLocation,
  onAddNewLocation,
  onReplaceLocation,
  isSyncingLocations
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="h-full">
        {isOptimizationPanelVisible ? (
          <RouteOptimizationPanel 
            route={route}
            onClose={onClose}
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
                onOptimize={onOptimize}
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
                routeLocations={routeLocations}
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
    </div>
  );
};
