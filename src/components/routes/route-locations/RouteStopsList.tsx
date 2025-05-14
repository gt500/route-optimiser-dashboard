
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cylinder } from 'lucide-react';
import { LocationType } from '@/types/location';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RouteStopsListProps {
  routeLocations: LocationType[];
  onRemoveLocation: (index: number) => void;
}

const RouteStopsList: React.FC<RouteStopsListProps> = ({ 
  routeLocations, 
  onRemoveLocation 
}) => {
  if (routeLocations.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-4 text-center mt-4">
        <p className="text-muted-foreground">No stops added to your route yet</p>
        <p className="text-xs text-muted-foreground">Add route stops from the list below</p>
      </div>
    );
  }

  return (
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
  );
};

export default RouteStopsList;
