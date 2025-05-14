
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LocationType } from '@/types/location';
import LocationSelector from '../LocationSelector';

interface AvailableLocationsProps {
  availableLocations: LocationType[];
  routeLocations: LocationType[];
  startLocationId?: string;
  endLocationId?: string;
  getCylinderCount: (locationId: string) => number;
  handleChangeCylinderCount: (locationId: string, change: number) => void;
  addLocationWithCylinders: (locationId: string) => void;
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void;
}

const AvailableLocations: React.FC<AvailableLocationsProps> = ({
  availableLocations,
  routeLocations,
  startLocationId,
  endLocationId,
  getCylinderCount,
  handleChangeCylinderCount,
  addLocationWithCylinders,
  onAddLocationToRoute
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium flex items-center">
        Available Route Stops
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          New
        </Button>
      </h3>

      <LocationSelector
        locations={availableLocations}
        routeLocations={routeLocations}
        startLocationId={startLocationId}
        endLocationId={endLocationId}
        onSelect={(locationId, cylinders) => {
          const location = availableLocations.find((loc) => loc.id === locationId);
          if (location) {
            onAddLocationToRoute({ ...location, cylinders });
          }
        }}
      />
    </div>
  );
};

export default AvailableLocations;
