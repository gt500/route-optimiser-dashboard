
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Fuel, CirclePlus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface RouteStopsListProps {
  locations: LocationType[];
  availableLocations: LocationType[];
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
  routeMetrics?: {
    distance: number;
    duration: number;
    fuelCost: number;
  };
  onReplaceLocation?: (index: number, newLocationId: string) => void;
}

const RouteStopsList: React.FC<RouteStopsListProps> = ({
  locations,
  availableLocations,
  onRemoveLocation,
  onAddNewLocation,
  routeMetrics,
  onReplaceLocation
}) => {
  const [expandedStop, setExpandedStop] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  if (!locations || locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Stops</CardTitle>
          <CardDescription>No stops added yet</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Button onClick={() => setIsPickerOpen(true)} variant="outline" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Add a stop
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate segment metrics if waypointData is not provided
  const calculateSegmentMetrics = (index: number) => {
    if (!routeMetrics || locations.length < 2 || index === 0) {
      return { distance: 0, duration: 0, fuelCost: 0 };
    }
    
    // Simple estimation - divide by number of segments
    const segments = locations.length - 1;
    return {
      distance: routeMetrics.distance / segments,
      duration: routeMetrics.duration / segments,
      fuelCost: routeMetrics.fuelCost / segments
    };
  };
  
  const handleToggleExpand = (index: number) => {
    setExpandedStop(expandedStop === index ? null : index);
  };
  
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  const formatCost = (cost: number): string => {
    return `R${cost.toFixed(2)}`;
  };
  
  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Route Stops</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-1 flex items-center gap-1.5">
            {locations.length} {locations.length === 1 ? 'stop' : 'stops'}
          </div>
        </div>
        <CardDescription>Route delivery stops</CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="divide-y">
          {locations.map((location, index) => {
            const isStart = index === 0;
            const isEnd = index === locations.length - 1;
            const segmentMetrics = calculateSegmentMetrics(index);
            
            // Calculate cylinder info based on location type
            const cylinderInfo = location.type === 'Customer' || location.type === 'Distribution'
              ? { type: 'Pickup', count: location.emptyCylinders || 0 }
              : { type: 'Storage', count: location.fullCylinders || 0 };
            
            return (
              <div key={location.id} className="py-3 px-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      isStart ? 'bg-blue-500' : isEnd ? 'bg-green-500' : 'bg-primary'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{location.address || ''}</div>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {cylinderInfo.type === 'Pickup' ? 'Pickup:' : 'Storage:'} {cylinderInfo.count} cylinders
                      </span>
                    </div>
                    
                    {!isStart && segmentMetrics.distance > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{formatDistance(segmentMetrics.distance)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatTime(segmentMetrics.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Fuel className="h-3.5 w-3.5" />
                          <span>{formatCost(segmentMetrics.fuelCost)}</span>
                        </div>
                      </div>
                    )}
                    
                    {expandedStop === index && (
                      <div className="mt-2 bg-muted/30 p-2 rounded-md">
                        <div className="text-sm font-medium mb-1">Actions</div>
                        <div className="flex gap-2">
                          {!isStart && !isEnd && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => onRemoveLocation(index)}
                              className="h-8 gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                          {onReplaceLocation && !isStart && !isEnd && (
                            <Select onValueChange={(value) => onReplaceLocation(index, value)}>
                              <SelectTrigger className="h-8 gap-1">
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                <SelectValue placeholder="Replace" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLocations.map((loc) => (
                                  <SelectItem key={loc.id} value={loc.id.toString()}>
                                    {loc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleToggleExpand(index)}
                    >
                      {expandedStop === index ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-3">
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <CirclePlus className="h-4 w-4" />
                Add Stop
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="max-h-64 overflow-auto">
                <div className="font-medium mb-2">Select a location:</div>
                {availableLocations.length === 0 ? (
                  <div className="text-sm text-center py-4 text-muted-foreground">
                    No available locations
                  </div>
                ) : (
                  <div className="space-y-1">
                    {availableLocations.map(location => (
                      <Button
                        key={location.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onAddNewLocation(location.id);
                          setIsPickerOpen(false);
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {location.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteStopsList;
