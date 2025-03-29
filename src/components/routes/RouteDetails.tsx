import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TruckIcon, RotateCw, Info, Trash2, ArrowUpDown, Plus, Clock, Fuel } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { toast } from 'sonner';
import { LocationType } from '../locations/LocationEditDialog';
import FuelCostEditor from './FuelCostEditor';
import { supabase } from '@/integrations/supabase/client';

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    availableLocations: LocationType[];
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy';
    usingRealTimeData?: boolean;
  };
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: number | string) => void;
  onFuelCostUpdate?: (newFuelCost: number) => void;
  onRouteDataUpdate?: (distance: number, duration: number) => void;
}

const RouteDetails = ({ 
  route, 
  onRemoveLocation, 
  onAddNewLocation, 
  onFuelCostUpdate,
  onRouteDataUpdate 
}: RouteDetailsProps) => {
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(22); // Default value
  const [routeDistance, setRouteDistance] = useState(route.distance);
  const [routeDuration, setRouteDuration] = useState(route.estimatedDuration || 0);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  
  // Debug logging for route locations
  useEffect(() => {
    console.log("RouteDetails - Current route locations:", route.locations);
  }, [route.locations]);
  
  // Update local state when route data changes
  useEffect(() => {
    if (route.distance > 0) {
      setRouteDistance(route.distance);
    }
    if (route.estimatedDuration && route.estimatedDuration > 0) {
      setRouteDuration(route.estimatedDuration);
    }
  }, [route.distance, route.estimatedDuration]);
  
  useEffect(() => {
    // Fetch current fuel cost from the database
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value')
        .eq('name', 'fuel_cost_per_liter')
        .single();
      
      if (error) {
        console.error('Error fetching fuel cost:', error);
        return;
      }
      
      if (data) {
        setFuelCostPerLiter(data.value);
        if (onFuelCostUpdate) {
          onFuelCostUpdate(data.value);
        }
      }
    };
    
    fetchFuelCost();
  }, [onFuelCostUpdate]);
  
  const getTrafficBadgeVariant = (condition?: 'light' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'light': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'heavy': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleFuelCostChange = (newCost: number) => {
    setFuelCostPerLiter(newCost);
    if (onFuelCostUpdate) {
      onFuelCostUpdate(newCost);
    }
  };
  
  // Handle route data updates from the map component
  const handleRouteDataUpdate = (distance: number, duration: number) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
    if (onRouteDataUpdate) {
      onRouteDataUpdate(distance, duration);
    }
  };
  
  // Calculate the actual fuel consumption based on distance
  const calculateFuelConsumption = () => {
    return routeDistance * 0.12; // 12L per 100km
  };
  
  // Calculate the actual fuel cost based on distance and current fuel price
  const calculateFuelCost = () => {
    const consumption = calculateFuelConsumption();
    return consumption * fuelCostPerLiter;
  };
  
  // Use calculated values or fallback to route props
  const displayDistance = routeDistance > 0 ? routeDistance : route.distance;
  const displayDuration = routeDuration > 0 ? routeDuration : (route.estimatedDuration || Math.round(displayDistance * 1.5));
  const displayConsumption = calculateFuelConsumption() || route.fuelConsumption;
  const displayFuelCost = calculateFuelCost() || route.fuelCost;
  
  const handleLocationChange = (locationId: string) => {
    console.log("Selected location ID to add:", locationId);
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-black">
          <CardContent className="p-4">
            <h3 className="text-sm flex items-center gap-2 font-medium mb-2 text-white">
              <span>Total Distance</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                    <Info className="h-3 w-3" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="text-sm">
                    {route.usingRealTimeData 
                      ? 'Distance calculated using real-time traffic data for the fastest route.' 
                      : 'Total distance calculated based on the optimized route between all stops.'}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </h3>
            <div className="text-2xl font-bold text-white">{displayDistance.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-gray-300">Estimated travel time: {displayDuration} min</span>
              {route.trafficConditions && (
                <Badge variant="outline" className={getTrafficBadgeVariant(route.trafficConditions)}>
                  {route.trafficConditions} traffic
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-black">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2 text-white">Fuel Consumption</h3>
            <div className="text-2xl font-bold text-white">{displayConsumption.toFixed(1)} L</div>
            <p className="text-xs text-gray-300">Based on average consumption of 12L/100km</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-black">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between text-white">
              <span>Fuel Cost</span>
              <FuelCostEditor 
                currentFuelCost={fuelCostPerLiter} 
                onFuelCostChange={handleFuelCostChange} 
              />
            </h3>
            <div className="text-2xl font-bold text-white">R {displayFuelCost.toFixed(2)}</div>
            <p className="text-xs text-gray-300">At current price of R{fuelCostPerLiter.toFixed(2)}/L</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-black">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2 text-white">Load</h3>
            <div className="text-2xl font-bold text-white">{route.cylinders}/80 cylinders</div>
            <Progress value={(route.cylinders/80)*100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

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
                        {route.availableLocations && route.availableLocations.map((loc) => (
                          <SelectItem key={loc.id.toString()} value={loc.id.toString()}>
                            {loc.name}
                          </SelectItem>
                        ))}
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
          {route.locations && route.locations.length > 0 ? (
            route.locations.map((location, index) => (
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
                  {index > 0 && index < route.locations.length - 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        console.log("Removing location at index:", index);
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
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Save Route</Button>
        <Button className="gap-1" onClick={() => toast.success(
          route.usingRealTimeData 
            ? "Route re-optimized with latest traffic data" 
            : "Route successfully optimized"
        )}>
          <RotateCw className="h-4 w-4" />
          Re-optimize
        </Button>
      </div>
    </div>
  );
};

export default RouteDetails;
