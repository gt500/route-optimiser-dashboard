
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { LocationType } from '@/types/location';
import RouteEndpoints from './RouteEndpoints';
import RouteStopsList from './RouteStopsList';
import AvailableLocations from './AvailableLocations';
import useCylinderState from './hooks/useCylinderState';
import TruckWeightIndicator from '../../reports/TruckWeightIndicator';

interface RouteLocationsProps {
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  routeLocations: LocationType[];
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string) => void;
  onReplaceLocation: (index: number, newLocationId: string) => void;
  isSyncingLocations: boolean;
  allowSameStartEndLocation?: boolean;
  hideEndpoints?: boolean;
}

const RouteLocations: React.FC<RouteLocationsProps> = ({
  availableLocations,
  startLocation,
  endLocation,
  routeLocations,
  onStartLocationChange,
  onEndLocationChange,
  onAddLocationToRoute,
  onRemoveLocation,
  onAddNewLocation,
  onReplaceLocation,
  isSyncingLocations,
  allowSameStartEndLocation = false,
  hideEndpoints = false
}) => {
  // Use the cylinder state hook to manage cylinder counts
  const { 
    locationCylinders, 
    getCylinderCount, 
    handleChangeCylinderCount, 
    addLocationWithCylinders
  } = useCylinderState(availableLocations, onAddLocationToRoute);

  if (isSyncingLocations) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading route stops...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Endpoints Section */}
          {!hideEndpoints && (
            <RouteEndpoints 
              availableLocations={availableLocations}
              startLocation={startLocation}
              endLocation={endLocation}
              onStartLocationChange={onStartLocationChange}
              onEndLocationChange={onEndLocationChange}
              allowSameStartEndLocation={allowSameStartEndLocation}
            />
          )}

          {/* Route Stops Section */}
          <div>
            <h3 className="text-lg font-medium">Route Stops</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add and arrange stops for your delivery route
            </p>
            
            <TruckWeightIndicator
              totalCylinders={routeLocations.reduce((sum, loc) => sum + (loc.emptyCylinders || 0), 0)}
              locations={routeLocations}
              startLocationId={startLocation?.id}
              endLocationId={endLocation?.id}
            />

            <RouteStopsList 
              routeLocations={routeLocations}
              onRemoveLocation={onRemoveLocation}
            />
          </div>

          {/* Available Route Stops Section */}
          <AvailableLocations 
            availableLocations={availableLocations}
            routeLocations={routeLocations}
            getCylinderCount={getCylinderCount}
            handleChangeCylinderCount={handleChangeCylinderCount}
            addLocationWithCylinders={addLocationWithCylinders}
            onAddLocationToRoute={onAddLocationToRoute}
            startLocationId={startLocation?.id}
            endLocationId={endLocation?.id}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteLocations;
