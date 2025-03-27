import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Map, TruckIcon, RotateCw, Info, Trash2, ArrowUpDown, AlertCircle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LocationSelector from '@/components/routes/LocationSelector';
import { LocationType } from '@/components/locations/LocationEditDialog';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import RouteEndpoints from '@/components/routes/RouteEndpoints';

const RouteMap = ({ route }) => {
  return (
    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-border shadow-sm">
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        {route ? (
          <div className="text-center space-y-3">
            <div className="w-full h-full absolute">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <path 
                  d="M150,200 C250,100 350,300 450,150 S650,250 750,200" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  className="text-primary route-path"
                />
                
                {route.locations.map((location, i) => (
                  <circle 
                    key={i} 
                    cx={150 + i * 150} 
                    cy={200 + (i % 2 === 0 ? -50 : 50)} 
                    r="8" 
                    className="fill-primary" 
                  />
                ))}
              </svg>
            </div>
            <div className="absolute bottom-4 right-4 z-10">
              <Card className="w-auto bg-background/90 backdrop-blur-sm shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Route:</span> 
                    <span className="text-muted-foreground">{route.distance} km</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{Math.round(route.distance * 1.5)} min</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Map className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Map visualization will appear here</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Select locations and define a route to see the optimized path</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RouteDetails = ({ route, onRemoveLocation, onAddNewLocation }) => {
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.distance} km</div>
            <p className="text-xs text-muted-foreground">Estimated travel time: {Math.round(route.distance * 1.5)} min</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.fuelConsumption} L</div>
            <p className="text-xs text-muted-foreground">Based on average consumption of 12L/100km</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {route.fuelCost}</div>
            <p className="text-xs text-muted-foreground">At current price of R22/L</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Load</CardTitle>
          </CardHeader>
          <CardContent>
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
              <PopoverContent className="w-80" align="end">
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
                  {location.cylinders} cylinders
                </Badge>
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

const OptimizationParameters = ({ onOptimize }) => {
  const [prioritizeFuel, setPrioritizeFuel] = useState(false);
  const [avoidTraffic, setAvoidTraffic] = useState(true);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Optimization Parameters</CardTitle>
        <CardDescription>Configure how the route should be optimized</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="font-medium">Prioritize Fuel Efficiency</div>
            <div className="text-xs text-muted-foreground">May result in longer travel times</div>
          </div>
          <Button 
            variant={prioritizeFuel ? "default" : "outline"} 
            size="sm"
            onClick={() => setPrioritizeFuel(!prioritizeFuel)}
          >
            {prioritizeFuel ? "On" : "Off"}
          </Button>
        </div>
        
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="font-medium">Avoid Traffic</div>
            <div className="text-xs text-muted-foreground">Uses real-time traffic data</div>
          </div>
          <Button 
            variant={avoidTraffic ? "default" : "outline"} 
            size="sm"
            onClick={() => setAvoidTraffic(!avoidTraffic)}
          >
            {avoidTraffic ? "On" : "Off"}
          </Button>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => {
              onOptimize({ prioritizeFuel, avoidTraffic });
              toast.success("Route optimization settings updated");
            }} 
            className="w-full gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Apply Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Routes = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [newLocationDialog, setNewLocationDialog] = useState(false);
  
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>([
    { id: 1, name: 'Warehouse A', address: '123 Main St, Cape Town', lat: -33.9248, long: 18.4173, type: 'Storage', fullCylinders: 100, emptyCylinders: 0 },
    { id: 2, name: 'Hotel B', address: '789 Mountain View, Camps Bay', lat: -33.9500, long: 18.3836, type: 'Customer', fullCylinders: 0, emptyCylinders: 15 },
    { id: 3, name: 'Restaurant C', address: '101 Long St, City Center', lat: -33.9248, long: 18.4173, type: 'Customer', fullCylinders: 0, emptyCylinders: 8 },
    { id: 4, name: 'Hotel D', address: '234 Kloof St, Gardens', lat: -33.9263, long: 18.4132, type: 'Customer', fullCylinders: 0, emptyCylinders: 23 },
    { id: 5, name: 'Restaurant E', address: '567 Main Rd, Green Point', lat: -33.9317, long: 18.4232, type: 'Customer', fullCylinders: 0, emptyCylinders: 18 },
  ]);
  
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  
  const [route, setRoute] = useState({
    distance: 45.7,
    fuelConsumption: 5.48,
    fuelCost: 120.29,
    cylinders: 58,
    locations: [] as any[],
    availableLocations: [] as LocationType[]
  });

  useEffect(() => {
    if (startLocation) {
      setRoute(prev => ({
        ...prev,
        locations: [
          startLocation,
          ...prev.locations.filter(loc => loc.id !== startLocation.id && loc.id !== endLocation?.id),
          ...(endLocation ? [endLocation] : [])
        ]
      }));
    }
  }, [startLocation, endLocation]);
  
  useEffect(() => {
    setRoute(prev => ({
      ...prev,
      availableLocations: availableLocations.filter(loc => 
        loc.id !== startLocation?.id && 
        loc.id !== endLocation?.id &&
        !prev.locations.some(routeLoc => routeLoc.id === loc.id)
      )
    }));
  }, [availableLocations, startLocation, endLocation]);

  const handleStartLocationChange = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    setStartLocation(location || null);
  };

  const handleEndLocationChange = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    setEndLocation(location || null);
  };

  const addLocationToRoute = (location) => {
    setRoute(prev => ({
      ...prev,
      cylinders: prev.cylinders + location.cylinders,
      locations: [...prev.locations, { ...location, id: prev.locations.length }]
    }));
  };

  const removeLocationFromRoute = (index: number) => {
    if (index === 0 || index === route.locations.length - 1) return;
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      const removedLocation = newLocations[index];
      newLocations.splice(index, 1);
      
      return {
        ...prev,
        cylinders: prev.cylinders - (removedLocation.cylinders || 0),
        locations: newLocations,
        availableLocations: [...prev.availableLocations, removedLocation]
      };
    });
    
    toast.success("Location removed from route");
  };

  const handleOptimize = (params) => {
    console.log("Optimizing with params:", params);
    setRoute(prev => ({
      ...prev,
      distance: params.prioritizeFuel ? prev.distance * 0.95 : prev.distance * 1.05,
      fuelConsumption: params.prioritizeFuel ? prev.fuelConsumption * 0.9 : prev.fuelConsumption * 1.02,
      fuelCost: params.prioritizeFuel ? prev.fuelCost * 0.9 : prev.fuelCost * 1.02,
    }));
  };

  const handleCreateNewRoute = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRoute({
      distance: 0,
      fuelConsumption: 0,
      fuelCost: 0,
      cylinders: 0,
      locations: [],
      availableLocations: availableLocations
    });
    toast.info("New route created");
  };

  const handleUpdateLocations = (updatedLocations: LocationType[]) => {
    setAvailableLocations(updatedLocations);
    
    setRoute(prev => {
      const updatedRouteLocations = prev.locations.map(routeLoc => {
        const updatedLoc = updatedLocations.find(loc => loc.id === routeLoc.id);
        if (updatedLoc) {
          return {
            ...routeLoc,
            name: updatedLoc.name,
            address: updatedLoc.address,
            type: updatedLoc.type
          };
        }
        return routeLoc;
      });
      
      return {
        ...prev,
        locations: updatedRouteLocations,
        availableLocations: updatedLocations
      };
    });
  };

  const addNewLocation = () => {
    setNewLocationDialog(true);
  };

  const handleAddNewLocationFromPopover = (locationId) => {
    const location = availableLocations.find(loc => loc.id === locationId);
    if (location) {
      addLocationToRoute({...location, cylinders: 10});
      toast.success(`Added ${location.name} to route`);
    }
  };

  const handleSaveNewLocation = (location: LocationType) => {
    const newLocation = {
      ...location,
      id: availableLocations.length + 1
    };
    
    const updatedLocations = [...availableLocations, newLocation];
    handleUpdateLocations(updatedLocations);
    
    toast.success(`New location "${location.name}" added`);
    setNewLocationDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Route Optimizer</h1>
          <p className="text-muted-foreground">Create and manage delivery routes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={addNewLocation}>
            <MapPin className="h-4 w-4" />
            New Location
          </Button>
          <Button className="gap-2" onClick={handleCreateNewRoute}>
            <Plus className="h-4 w-4" />
            New Route
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="create">Create Route</TabsTrigger>
          <TabsTrigger value="active">Active Routes</TabsTrigger>
          <TabsTrigger value="history">Route History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Route Preview</CardTitle>
                  <CardDescription>
                    Optimized delivery path with cost calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RouteMap route={route} />
                  <RouteDetails 
                    route={route} 
                    onRemoveLocation={removeLocationFromRoute} 
                    onAddNewLocation={handleAddNewLocationFromPopover}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <RouteEndpoints
                availableLocations={availableLocations}
                startLocation={startLocation}
                endLocation={endLocation}
                onStartLocationChange={handleStartLocationChange}
                onEndLocationChange={handleEndLocationChange}
              />
              <LocationSelector 
                onAdd={addLocationToRoute} 
                availableLocations={route.availableLocations}
                onUpdateLocations={handleUpdateLocations}
              />
              <OptimizationParameters onOptimize={handleOptimize} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Routes</CardTitle>
              <CardDescription>
                Currently active delivery routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="rounded-full bg-secondary p-4">
                  <TruckIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No active routes</h3>
                <p className="text-muted-foreground max-w-md">
                  No routes are currently in progress. Create a new route and dispatch it to see it here.
                </p>
                <Button variant="outline" className="mt-2" onClick={() => setActiveTab('create')}>
                  Create Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Route History</CardTitle>
              <CardDescription>
                Previously completed routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="rounded-full bg-secondary p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No route history</h3>
                <p className="text-muted-foreground max-w-md">
                  Your completed routes will appear here. You haven't completed any routes yet.
                </p>
                <Button variant="outline" className="mt-2" onClick={() => setActiveTab('create')}>
                  Create Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LocationEditDialog 
        open={newLocationDialog}
        onOpenChange={setNewLocationDialog}
        location={null}
        onSave={handleSaveNewLocation}
      />
    </div>
  );
};

export default Routes;
