
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TruckIcon, Trash2, ArrowUpDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LocationType } from '@/components/locations/LocationEditDialog';

interface RouteStopsListProps {
  locations: LocationType[];
  availableLocations: LocationType[];
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: string | number) => void;
}

const RouteStopsList: React.FC<RouteStopsListProps> = ({ 
  locations, 
  availableLocations, 
  onRemoveLocation,
  onAddNewLocation
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
  
  return (
    <div className="bg-black rounded-lg p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white">
          <TruckIcon className="h-5 w-5" />
          <div className="font-medium">Route Stops</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1">
            <ArrowUpDown className="h-3 w-3" />
            <span className="text-xs">Reorder</span>
          </Button>
          <Popover open={addLocationOpen} onOpenChange={setAddLocationOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <Plus className="h-3 w-3" />
                <span className="text-xs">Add Stop</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover" align="end">
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
                    <SelectContent>
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
      
      <div className="space-y-3">
        {locations && locations.length > 0 ? (
          locations.map((location, index) => (
            <div 
              key={`route-stop-${location.id}-${index}`}
              className="flex items-center gap-3 bg-background rounded-lg p-3 relative border border-border/80 hover:border-border transition-colors shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-medium">{location.name}</div>
                <div className="text-xs text-muted-foreground">{location.address}</div>
              </div>
              <div className="ml-auto text-sm font-medium flex items-center gap-2">
                <Badge variant={index === 0 ? "secondary" : "outline"} className="gap-1">
                  {location.emptyCylinders || 0} cylinders
                </Badge>
                {index > 0 && index < locations.length - 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      onRemoveLocation(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No locations added to this route yet. Add stops using the button above or from the location selector.
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteStopsList;
