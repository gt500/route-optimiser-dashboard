
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationType } from '@/types/location';
import RouteStopsList from './RouteStopsList';
import RouteEndpoints from './RouteEndpoints';
import AvailableLocations from './AvailableLocations';
import useCylinderState from './hooks/useCylinderState';

interface RouteLocationsProps {
  routeLocations: LocationType[];
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  onAddLocation?: (location: LocationType & { cylinders: number }) => void;
  onAddLocationToRoute?: (location: LocationType & { cylinders: number }) => void;
  onRemoveLocation: (locationId: string | number) => void;
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  onMoveLocation?: (dragIndex: number, hoverIndex: number) => void;
  onAddNewLocation?: (locationId: string | number) => void;
  onReplaceLocation?: (index: number, newLocationId: string) => void;
  isSyncingLocations?: boolean;
  allowSameStartEndLocation?: boolean;
  hideEndpoints?: boolean;
}

const RouteLocations: React.FC<RouteLocationsProps> = ({
  routeLocations,
  availableLocations,
  startLocation,
  endLocation,
  onAddLocation,
  onAddLocationToRoute,
  onRemoveLocation,
  onStartLocationChange,
  onEndLocationChange,
  onMoveLocation,
  allowSameStartEndLocation,
  hideEndpoints
}) => {
  // Use the cylinder state custom hook
  const {
    locationCylinders,
    handleChangeCylinderCount,
    getCylinderCount,
    addLocationWithCylinders
  } = useCylinderState(availableLocations, onAddLocation || onAddLocationToRoute || (() => {}));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {!hideEndpoints && (
              <RouteEndpoints
                startLocation={startLocation}
                endLocation={endLocation}
                availableLocations={availableLocations}
                onStartLocationChange={onStartLocationChange}
                onEndLocationChange={onEndLocationChange}
                allowSameStartEndLocation={allowSameStartEndLocation}
              />
            )}

            <RouteStopsList
              routeLocations={routeLocations}
              onRemoveLocation={onRemoveLocation}
              onMoveLocation={onMoveLocation}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <AvailableLocations
            availableLocations={availableLocations}
            routeLocations={routeLocations}
            startLocationId={startLocation?.id}
            endLocationId={endLocation?.id}
            getCylinderCount={getCylinderCount}
            handleChangeCylinderCount={handleChangeCylinderCount}
            addLocationWithCylinders={addLocationWithCylinders}
            onAddLocationToRoute={onAddLocationToRoute || onAddLocation || (() => {})}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteLocations;
