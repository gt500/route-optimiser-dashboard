
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationType } from '@/types/location';
import { PlusCircle, Loader2, Cylinder } from 'lucide-react';
import LocationSelector from './LocationSelector';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  allowSameStartEndLocation = false
}) => {
  // New state for cylinder counts for each location
  const [locationCylinders, setLocationCylinders] = React.useState<{[key: string]: number}>({});

  const handleChangeCylinderCount = (locationId: string, change: number) => {
    setLocationCylinders(prev => {
      const current = prev[locationId] || 10;
      const newCount = Math.max(1, Math.min(25, current + change));
      return { ...prev, [locationId]: newCount };
    });
  };

  const getCylinderCount = (locationId: string) => {
    return locationCylinders[locationId] || 10;
  };

  const addLocationWithCylinders = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    if (location) {
      const cylinderCount = getCylinderCount(locationId);
      onAddLocationToRoute({ ...location, cylinders: cylinderCount });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {isSyncingLocations ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading locations...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Location</label>
                <select
                  value={startLocation?.id || ''}
                  onChange={(e) => onStartLocationChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select Start Location</option>
                  {availableLocations
                    .filter((loc) => loc.type === 'Storage' || 
                                    (allowSameStartEndLocation ? true : loc.id !== endLocation?.id))
                    .map((location) => (
                      <option key={`start-${location.id}`} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Location</label>
                <select
                  value={endLocation?.id || ''}
                  onChange={(e) => onEndLocationChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select End Location</option>
                  {availableLocations
                    .filter((loc) => 
                      allowSameStartEndLocation ? true : loc.id !== startLocation?.id)
                    .map((location) => (
                      <option key={`end-${location.id}`} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Route Stops</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Add and arrange stops for your delivery route
              </p>

              {routeLocations.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {routeLocations.map((location, index) => (
                    <div
                      key={`route-location-${location.id}-${index}`}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 rounded-full h-7 w-7 flex items-center justify-center text-white font-medium text-sm">
                          {location.emptyCylinders || location.cylinders || 0}
                        </div>
                        <div>
                          <span className="font-medium">{index + 1}. {location.name}</span>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-slate-100 px-2 py-1 rounded text-xs flex items-center">
                                <Cylinder className="h-3 w-3 mr-1" />
                                {location.emptyCylinders || location.cylinders || 0}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cylinders to deliver</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveLocation(index)}
                          className="h-8 w-8 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-4 text-center">
                  <p className="text-muted-foreground">No stops added to your route yet</p>
                  <p className="text-xs text-muted-foreground">Add locations from the list below</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium flex items-center">
                Available Locations
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => {/* Add new location action */}}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  New
                </Button>
              </h3>

              <LocationSelector
                locations={availableLocations}
                onSelect={(locationId, cylinders) => {
                  const location = availableLocations.find((loc) => loc.id === locationId);
                  if (location) {
                    onAddLocationToRoute({ ...location, cylinders });
                  }
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteLocations;
