
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TruckIcon, RotateCw, Info, Trash2, ArrowUpDown, Plus } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { toast } from 'sonner';
import { LocationType } from '../locations/LocationEditDialog';

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    availableLocations: LocationType[];
  };
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: number) => void;
}

const RouteDetails = ({ route, onRemoveLocation, onAddNewLocation }: RouteDetailsProps) => {
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="text-sm flex items-center gap-2 font-medium mb-2">
              <span>Total Distance</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                    <Info className="h-3 w-3" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="text-sm">
                    Total distance calculated based on the optimized route between all stops.
                  </div>
                </HoverCardContent>
              </HoverCard>
            </h3>
            <div className="text-2xl font-bold">{route.distance} km</div>
            <p className="text-xs text-muted-foreground">Estimated travel time: {Math.round(route.distance * 1.5)} min</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Fuel Consumption</h3>
            <div className="text-2xl font-bold">{route.fuelConsumption} L</div>
            <p className="text-xs text-muted-foreground">Based on average consumption of 12L/100km</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Fuel Cost</h3>
            <div className="text-2xl font-bold">R {route.fuelCost}</div>
            <p className="text-xs text-muted-foreground">At current price of R22/L</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Load</h3>
            <div className="text-2xl font-bold">{route.cylinders}/80 cylinders</div>
            <Progress value={(route.cylinders/80)*100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary/30 rounded-lg p-4 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-muted-foreground" />
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
                      onValueChange={(value) => {
                        const locationId = parseInt(value);
                        onAddNewLocation(locationId);
                        setAddLocationOpen(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {route.availableLocations && route.availableLocations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-3">
          {route.locations.map((location, index) => (
            <div 
              key={index} 
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
                {index > 0 && index < route.locations.length - 1 && (
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
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Save Route</Button>
        <Button className="gap-1" onClick={() => toast.success("Route successfully optimized")}>
          <RotateCw className="h-4 w-4" />
          Re-optimize
        </Button>
      </div>
    </div>
  );
};

export default RouteDetails;
