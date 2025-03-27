
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TruckIcon, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LocationType } from '@/components/locations/LocationEditDialog';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import RouteEndpoints from '@/components/routes/RouteEndpoints';
import LocationSelector from '@/components/routes/LocationSelector';
import RouteMap from '@/components/routes/RouteMap';
import RouteDetails from '@/components/routes/RouteDetails';
import OptimizationParameters from '@/components/routes/OptimizationParameters';

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
    cylinders: 0,
    locations: [] as LocationType[],
    availableLocations: [] as LocationType[]
  });

  useEffect(() => {
    if (startLocation) {
      setRoute(prev => {
        const existingMiddleLocations = prev.locations.filter(loc => 
          loc.id !== startLocation.id && 
          loc.id !== endLocation?.id &&
          (loc.id !== prev.locations[0]?.id) && 
          (loc.id !== prev.locations[prev.locations.length - 1]?.id)
        );
        
        return {
          ...prev,
          locations: [
            startLocation,
            ...existingMiddleLocations,
            ...(endLocation ? [endLocation] : [])
          ]
        };
      });
    }
  }, [startLocation, endLocation]);
  
  useEffect(() => {
    setRoute(prev => {
      const routeLocationIds = prev.locations.map(loc => loc.id);
      return {
        ...prev,
        availableLocations: availableLocations.filter(loc => 
          !routeLocationIds.includes(loc.id)
        )
      };
    });
  }, [availableLocations, route.locations]);

  const handleStartLocationChange = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    setStartLocation(location || null);
  };

  const handleEndLocationChange = (locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    setEndLocation(location || null);
  };

  const addLocationToRoute = (location: LocationType & { cylinders: number }) => {
    const locationWithCylinders = {
      ...location,
      emptyCylinders: location.cylinders,
    };
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      
      // If we have an end location, insert before it, otherwise add to the end
      if (endLocation && newLocations.length > 1) {
        newLocations.splice(newLocations.length - 1, 0, locationWithCylinders);
      } else {
        newLocations.push(locationWithCylinders);
      }
      
      return {
        ...prev,
        cylinders: prev.cylinders + location.cylinders,
        locations: newLocations
      };
    });
  };

  const removeLocationFromRoute = (index: number) => {
    // Don't allow removing start or end locations
    if (index === 0 || (endLocation && index === route.locations.length - 1)) return;
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      const removedLocation = newLocations[index];
      newLocations.splice(index, 1);
      
      return {
        ...prev,
        cylinders: prev.cylinders - (removedLocation.emptyCylinders || 0),
        locations: newLocations,
        availableLocations: [...prev.availableLocations, removedLocation]
      };
    });
    
    toast.success("Location removed from route");
  };

  const handleOptimize = (params: { prioritizeFuel: boolean; avoidTraffic: boolean }) => {
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
        locations: updatedRouteLocations
      };
    });
  };

  const addNewLocation = () => {
    setNewLocationDialog(true);
  };

  const handleAddNewLocationFromPopover = (locationId: number) => {
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

  // Calculate the filtered available locations (excluding start and end locations)
  const filteredAvailableLocations = React.useMemo(() => {
    return availableLocations.filter(loc => 
      loc.id !== startLocation?.id && 
      loc.id !== endLocation?.id &&
      !route.locations.some(routeLoc => routeLoc.id === loc.id)
    );
  }, [availableLocations, startLocation, endLocation, route.locations]);

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
                  <RouteMap route={route.locations.length > 0 ? route : null} />
                  <RouteDetails 
                    route={{
                      ...route,
                      availableLocations: filteredAvailableLocations
                    }} 
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
                availableLocations={filteredAvailableLocations}
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
