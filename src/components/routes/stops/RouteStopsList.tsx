
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TruckIcon, Trash2, ArrowUpDown, Plus, MapPin, Package, Clock, DollarSign, Route } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationType } from '@/components/locations/LocationEditDialog';

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
}

const RouteStopsList: React.FC<RouteStopsListProps> = ({ 
  locations, 
  availableLocations, 
  onRemoveLocation,
  onAddNewLocation,
  routeMetrics
}) => {
  const [addLocationOpen, setAddLocationOpen] = React.useState(false);
  const [selectedLocationId, setSelectedLocationId] = React.useState<string>("");
  
  const handleLocationChange = (locationId: string) => {
    console.log("Selected location ID:", locationId);
    setSelectedLocationId(locationId);
  };
  
  const handleAddLocation = () => {
    if (selectedLocationId) {
      console.log("Adding location with ID:", selectedLocationId);
      onAddNewLocation(selectedLocationId);
      setAddLocationOpen(false);
      setSelectedLocationId("");
      toast.success("Location added to route");
    } else {
      toast.error("Please select a location first");
    }
  };

  // Calculate metrics per stop if routeMetrics is provided
  const calculateStopMetrics = () => {
    if (!routeMetrics || locations.length <= 1) return [];
    
    const { distance, duration, fuelCost } = routeMetrics;
    const stops = locations.length;
    
    // Calculate metrics per segment (between consecutive stops)
    const distancePerSegment = distance / (stops - 1);
    const durationPerSegment = duration / (stops - 1);
    const costPerSegment = fuelCost / (stops - 1);
    
    let cumulativeDistance = 0;
    let cumulativeDuration = 0;
    let cumulativeCost = 0;
    
    return locations.map((location, index) => {
      // First stop doesn't have metrics
      if (index === 0) {
        return { 
          location, 
          distanceSoFar: 0, 
          durationSoFar: 0, 
          costSoFar: 0 
        };
      }
      
      cumulativeDistance += distancePerSegment;
      cumulativeDuration += durationPerSegment;
      cumulativeCost += costPerSegment;
      
      return {
        location,
        distanceSoFar: cumulativeDistance,
        durationSoFar: cumulativeDuration,
        costSoFar: cumulativeCost
      };
    });
  };
  
  const stopMetrics = calculateStopMetrics();
  
  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5" />
          <div className="font-medium">Route Stops</div>
          <Badge variant="outline" className="ml-2">
            {locations.length} stops
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={addLocationOpen} onOpenChange={setAddLocationOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Add Stop</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Stop</h4>
                <div className="space-y-2">
                  <Select
                    value={selectedLocationId}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {availableLocations && availableLocations.length > 0 ? (
                        availableLocations.map((loc) => (
                          <SelectItem key={loc.id.toString()} value={loc.id.toString()}>
                            {loc.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No locations available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddLocation} 
                    className="w-full"
                    disabled={!selectedLocationId}
                  >
                    Add to Route
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <ScrollArea className="h-[500px] pr-2">
        <div className="space-y-2 relative">
          {/* Draw vertical route line connecting stops */}
          {locations.length > 1 && (
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
          )}
          
          {locations && locations.length > 0 ? (
            locations.map((location, index) => {
              const metrics = stopMetrics[index];
              // Make sure we're using cylinders consistently - either from cylinders property or emptyCylinders based on location type
              const cylinders = location.type === 'Storage' 
                ? location.fullCylinders || 0 
                : (location.emptyCylinders || 0);
              
              return (
                <div 
                  key={`route-stop-${location.id}-${index}`}
                  className="flex items-center gap-3 bg-background rounded-lg p-3 relative border border-border/80 hover:border-border transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold z-10">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{location.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{location.address}</div>
                    
                    {/* Cylinder/Storage info badge */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {location.type === 'Customer' && cylinders > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          Pickup: {cylinders} cylinders
                        </Badge>
                      )}
                      {location.type === 'Storage' && cylinders > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          Storage: {cylinders}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Route metrics - show only for stops after first */}
                    {index > 0 && metrics && routeMetrics && (
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                          {metrics.distanceSoFar.toFixed(1)} km
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-amber-500" />
                          {formatTime(metrics.durationSoFar)}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                          R{metrics.costSoFar.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm font-medium">
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveLocation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No locations added to this route yet.</p>
              <p className="text-sm">Add stops using the button above or from the location selector.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RouteStopsList;
