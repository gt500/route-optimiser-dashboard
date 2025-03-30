
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Gas, 
  Clock, 
  DollarSign, 
  Route, 
  Truck, 
  X,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FuelCostEditor } from '@/components/routes/FuelCostEditor';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { VehicleConfigProps } from '@/hooks/useRouteManagement';
import RouteMap from './RouteMap';

interface RouteDetailsProps {
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
  onRemoveLocation: (index: number) => void;
  onAddNewLocation?: (locationId: string | number) => void;
  onFuelCostUpdate?: (newCost: number) => void;
  onRouteDataUpdate?: (distance: number, duration: number) => void;
  onOptimize?: () => void;
  onSave?: () => void;
  isLoadConfirmed?: boolean;
  vehicleConfig?: VehicleConfigProps;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  route,
  onRemoveLocation,
  onAddNewLocation,
  onFuelCostUpdate,
  onRouteDataUpdate,
  onOptimize,
  onSave,
  isLoadConfirmed = false,
  vehicleConfig
}) => {
  const [totalDistance, setTotalDistance] = useState<number>(route.distance || 0);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState<number>(route.estimatedDuration || 0);
  const [fuelCost, setFuelCost] = useState<number>((vehicleConfig?.fuelPrice || 21.95));
  const [fullRouteDialogOpen, setFullRouteDialogOpen] = useState(false);
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX - draggablePosition.x;
    const startY = e.clientY - draggablePosition.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      setDraggablePosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    setTotalDistance(route.distance || 0);
    setTotalEstimatedTime(route.estimatedDuration || 0);
  }, [route.distance, route.estimatedDuration]);

  useEffect(() => {
    if (vehicleConfig) {
      setFuelCost(vehicleConfig.fuelPrice);
    }
  }, [vehicleConfig]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleFuelCostUpdate = (newCost: number) => {
    setFuelCost(newCost);
    if (onFuelCostUpdate) {
      onFuelCostUpdate(newCost);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 1) return; // Cannot move up depot or first location
    
    // Create new array with swapped locations
    const updatedLocations = [...route.locations];
    [updatedLocations[index], updatedLocations[index - 1]] = [updatedLocations[index - 1], updatedLocations[index]];
    
    // Inform parent component of change
    if (onRouteDataUpdate) {
      // Trigger route data recalculation with the new order
      onRouteDataUpdate(totalDistance, totalEstimatedTime);
    }
    
    // Update route with new location order (this should be handled by the parent)
    if (route.locations !== updatedLocations) {
      // Replace the route.locations with updatedLocations
      Object.assign(route, { locations: updatedLocations });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index >= route.locations.length - 2 || index === 0) return; // Cannot move down depot or last location
    
    // Create new array with swapped locations
    const updatedLocations = [...route.locations];
    [updatedLocations[index], updatedLocations[index + 1]] = [updatedLocations[index + 1], updatedLocations[index]];
    
    // Inform parent component of change
    if (onRouteDataUpdate) {
      // Trigger route data recalculation with the new order
      onRouteDataUpdate(totalDistance, totalEstimatedTime);
    }
    
    // Update route with new location order (this should be handled by the parent)
    if (route.locations !== updatedLocations) {
      // Replace the route.locations with updatedLocations
      Object.assign(route, { locations: updatedLocations });
    }
  };

  // Create waypoints for full route map display
  const transformedLocations = route.locations.map(loc => ({
    id: loc.id.toString(),
    name: loc.name,
    latitude: loc.lat,
    longitude: loc.long,
    address: loc.address || '',
  }));

  const waypoints = route.locations.slice(1, -1).map((loc, index) => ({
    name: loc.name,
    coords: [loc.lat || 0, loc.long || 0] as [number, number]
  }));

  const startLocation = route.locations.length > 0 ? {
    name: route.locations[0].name,
    coords: [route.locations[0].lat || 0, route.locations[0].long || 0] as [number, number]
  } : undefined;

  const endLocation = route.locations.length > 1 ? {
    name: route.locations[route.locations.length - 1].name,
    coords: [
      route.locations[route.locations.length - 1].lat || 0,
      route.locations[route.locations.length - 1].long || 0
    ] as [number, number]
  } : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h3 className="font-semibold text-lg mr-2">Route Details</h3>
          {route.usingRealTimeData && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Real-time data</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={fullRouteDialogOpen} onOpenChange={setFullRouteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Route className="h-4 w-4" />
                View Full Route
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[900px] max-h-[80vh] overflow-auto"
              isDraggable={true}
            >
              <div 
                className="cursor-move py-2"
                onMouseDown={startDrag}
                style={{
                  touchAction: 'none'
                }}
              >
                <DialogHeader>
                  <DialogTitle>Full Route Summary</DialogTitle>
                  <DialogDescription>
                    Complete route path with all stops and delivery details
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="h-[400px] mb-4 relative">
                <RouteMap
                  height="100%"
                  locations={transformedLocations}
                  showRouting={route.locations.length >= 2}
                  startLocation={startLocation}
                  endLocation={endLocation}
                  waypoints={waypoints}
                  trafficConditions={route.trafficConditions}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Total Distance</span>
                    </div>
                    <div className="text-lg font-semibold">{totalDistance.toFixed(1)} km</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Estimated Time</span>
                    </div>
                    <div className="text-lg font-semibold">{formatTime(totalEstimatedTime)}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Fuel Cost</span>
                    </div>
                    <div className="text-lg font-semibold">R {route.fuelCost.toFixed(2)}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Truck className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Cylinders</span>
                    </div>
                    <div className="text-lg font-semibold">{route.cylinders}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Route Stops</h3>
                  <div className="space-y-2">
                    {route.locations.map((location, index) => (
                      <Card key={`${location.id}-${index}`} className="border border-muted">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{location.name}</p>
                              <p className="text-xs text-muted-foreground">{location.address}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {onOptimize && (
                  <Button onClick={() => {
                    onOptimize();
                    toast.success("Route optimized");
                  }}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Optimize Route
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          {onOptimize && (
            <Button 
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                onOptimize();
                toast.success("Route optimized");
              }}
            >
              <ArrowUpDown className="h-4 w-4" />
              Optimize
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white border p-2 rounded-md">
          <div className="flex items-center text-gray-500 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Distance</span>
          </div>
          <div className="text-lg font-semibold">{totalDistance.toFixed(1)} km</div>
        </div>
        <div className="bg-white border p-2 rounded-md">
          <div className="flex items-center text-gray-500 mb-1">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Time</span>
          </div>
          <div className="text-lg font-semibold">{formatTime(totalEstimatedTime)}</div>
        </div>
        <div className="bg-white border p-2 rounded-md">
          <div className="flex items-center text-gray-500 mb-1">
            <Gas className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Fuel</span>
          </div>
          <div className="flex items-center">
            <div className="text-lg font-semibold mr-2">R {route.fuelCost.toFixed(2)}</div>
            <FuelCostEditor 
              currentCost={fuelCost}
              onUpdate={handleFuelCostUpdate}
            />
          </div>
        </div>
        <div className="bg-white border p-2 rounded-md">
          <div className="flex items-center text-gray-500 mb-1">
            <Truck className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Cylinders</span>
          </div>
          <div className="text-lg font-semibold">{route.cylinders}</div>
        </div>
      </div>
      
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Route Stops</h3>
          {onSave && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onSave}
              disabled={isLoadConfirmed}
              className="gap-1"
            >
              <DollarSign className="h-4 w-4" />
              {isLoadConfirmed ? "Saved" : "Save Route"}
            </Button>
          )}
        </div>
        
        {route.locations.length === 0 ? (
          <div className="p-4 border border-dashed rounded-md flex items-center justify-center text-gray-400">
            No stops added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {route.locations.map((location, index) => (
              <Card key={`${location.id}-${index}`} className="border border-gray-200">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {index === 0 || index === route.locations.length - 1 ? (
                      <div className={`flex items-center justify-center h-6 w-6 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold mr-2`}>
                        {index === 0 ? 'S' : 'E'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">
                        {index}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{location.name}</p>
                      <p className="text-xs text-gray-500">{location.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {index !== 0 && index !== route.locations.length - 1 && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleMoveUp(index)}
                          disabled={index <= 1}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleMoveDown(index)}
                          disabled={index >= route.locations.length - 2}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onRemoveLocation(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
