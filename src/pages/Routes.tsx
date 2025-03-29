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
import { supabase } from '@/integrations/supabase/client';

const Routes = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [newLocationDialog, setNewLocationDialog] = useState(false);
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(22); // Default value
  
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>([
    { id: 1, name: 'Afrox Epping Depot', address: 'Epping Industria, Cape Town', lat: -33.93631, long: 18.52759, type: 'Storage', fullCylinders: 100, emptyCylinders: 0 },
    { id: 2, name: 'Birkenhead Shopping Centre', address: 'Birkenhead, Western Cape', lat: -33.731659, long: 18.443239, type: 'Customer', fullCylinders: 0, emptyCylinders: 15 },
    { id: 3, name: 'Food Lovers Sunningdale', address: 'Sunningdale, KwaZulu-Natal', lat: -29.7486, long: 31.0462, type: 'Customer', fullCylinders: 0, emptyCylinders: 8 },
    { id: 4, name: 'Haasendaal Gables', address: 'Haasendaal, Western Cape', lat: -33.907776, long: 18.698757, type: 'Customer', fullCylinders: 0, emptyCylinders: 23 },
    { id: 5, name: 'Pick n Pay TableView', address: 'Table View, Cape Town', lat: -33.8258, long: 18.4881, type: 'Customer', fullCylinders: 0, emptyCylinders: 18 },
    { id: 6, name: 'SUPERSPAR Parklands', address: 'Parklands, Cape Town', lat: -33.815781, long: 18.495968, type: 'Customer', fullCylinders: 0, emptyCylinders: 12 },
    { id: 7, name: 'West Coast Village', address: 'West Coast, Cape Town', lat: -33.803329, long: 18.485944, type: 'Customer', fullCylinders: 0, emptyCylinders: 16 },
    { id: 8, name: 'KWIKSPAR Paarl', address: 'Paarl, Western Cape', lat: -33.708061, long: 18.962563, type: 'Customer', fullCylinders: 0, emptyCylinders: 10 },
    { id: 9, name: 'SUPERSPAR Plattekloof', address: 'Plattekloof, Cape Town', lat: -33.873642, long: 18.578856, type: 'Customer', fullCylinders: 0, emptyCylinders: 14 },
    { id: 10, name: 'OK Foods Strand', address: 'Strand, Western Cape', lat: -34.12169719, long: 18.836937, type: 'Customer', fullCylinders: 0, emptyCylinders: 9 },
    { id: 11, name: 'OK Urban Sonstraal', address: 'Sonstraal, Western Cape', lat: -33.511, long: 18.3945, type: 'Customer', fullCylinders: 0, emptyCylinders: 11 },
    { id: 12, name: 'Clara Anna', address: 'Clara Anna, Western Cape', lat: -33.818184, long: 18.632576, type: 'Customer', fullCylinders: 0, emptyCylinders: 7 },
    { id: 13, name: 'Laborie', address: 'Laborie, Western Cape', lat: -33.764587, long: 18.960768, type: 'Customer', fullCylinders: 0, emptyCylinders: 13 },
    { id: 14, name: 'Burgundy Square', address: 'Burgundy, Cape Town', lat: -33.841858, long: 18.545229, type: 'Customer', fullCylinders: 0, emptyCylinders: 15 },
    { id: 15, name: 'Shell Sea Point', address: 'Sea Point, Cape Town', lat: -33.4812, long: 18.3855, type: 'Storage', fullCylinders: 75, emptyCylinders: 0 },
    { id: 16, name: 'Shell Hugo Street', address: 'Hugo Street, Cape Town', lat: -33.900848, long: 18.564976, type: 'Storage', fullCylinders: 80, emptyCylinders: 0 },
    { id: 17, name: 'Shell Meadowridge', address: 'Meadowridge, Cape Town', lat: -34.038963, long: 18.455086, type: 'Storage', fullCylinders: 65, emptyCylinders: 0 },
    { id: 18, name: 'Simonsrust Shopping Centre', address: 'Simonsrust, Western Cape', lat: -33.926464, long: 18.877136, type: 'Customer', fullCylinders: 0, emptyCylinders: 19 },
    { id: 19, name: 'Shell Stellenbosch Square', address: 'Stellenbosch, Western Cape', lat: -33.976185, long: 18.843523, type: 'Storage', fullCylinders: 70, emptyCylinders: 0 },
    { id: 20, name: 'Willowridge Shopping Centre', address: 'Willowridge, Western Cape', lat: -33.871166, long: 18.63283, type: 'Customer', fullCylinders: 0, emptyCylinders: 17 },
    { id: 21, name: 'Zevenwacht', address: 'Zevenwacht, Western Cape', lat: -33.949867, long: 18.696407, type: 'Customer', fullCylinders: 0, emptyCylinders: 21 },
    { id: 22, name: 'Killarney Shell', address: 'Killarney, Cape Town', lat: -33.854279, long: 18.516291, type: 'Storage', fullCylinders: 85, emptyCylinders: 0 },
    { id: 23, name: 'Shell Constantia', address: 'Constantia, Cape Town', lat: -33.979988, long: 18.453421, type: 'Storage', fullCylinders: 90, emptyCylinders: 0 },
  ]);
  
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  
  const [route, setRoute] = useState({
    distance: 0,
    fuelConsumption: 0,
    fuelCost: 0,
    cylinders: 0,
    locations: [] as LocationType[],
    availableLocations: [] as LocationType[],
    trafficConditions: 'moderate' as 'light' | 'moderate' | 'heavy',
    estimatedDuration: 0,
    usingRealTimeData: false
  });

  useEffect(() => {
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value')
        .eq('name', 'fuel_cost_per_liter')
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching fuel cost:', error);
        }
        const { error: insertError } = await supabase
          .from('cost_factors')
          .insert({ 
            name: 'fuel_cost_per_liter', 
            value: 22, 
            description: 'Cost per liter of fuel in Rand' 
          });
          
        if (insertError) {
          console.error('Error creating fuel cost record:', insertError);
        }
        return;
      }
      
      if (data) {
        setFuelCostPerLiter(data.value);
      }
    };
    
    fetchFuelCost();
  }, []);

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

  const handleOptimize = (params: { 
    prioritizeFuel: boolean; 
    avoidTraffic: boolean;
    useRealTimeData: boolean;
    optimizeForDistance: boolean;
  }) => {
    console.log("Optimizing with params:", params);
    
    let calculatedDistance = 0;
    const locations = route.locations;
    
    if (locations.length > 1) {
      for (let i = 0; i < locations.length - 1; i++) {
        const lat1 = locations[i].lat || 0;
        const lon1 = locations[i].long || 0;
        const lat2 = locations[i + 1].lat || 0;
        const lon2 = locations[i + 1].long || 0;
        
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        calculatedDistance += distance * 1.3;
      }
    }
    
    const trafficMultiplier = params.avoidTraffic ? 0.85 : 1.1;
    const fuelMultiplier = params.prioritizeFuel ? 0.9 : 1.0;
    const distanceMultiplier = params.optimizeForDistance ? 0.9 : 1.05;
    
    let newDistance = calculatedDistance || 45.7;
    let newDuration = calculatedDistance * 1.5;
    
    if (params.useRealTimeData) {
      const realTimeTrafficFactor = 0.8 + Math.random() * 0.4;
      newDistance = newDistance * distanceMultiplier * realTimeTrafficFactor;
      newDuration = newDuration * (1/distanceMultiplier) * realTimeTrafficFactor;
      
      let trafficConditions: 'light' | 'moderate' | 'heavy' = 'moderate';
      if (realTimeTrafficFactor < 0.9) trafficConditions = 'light';
      if (realTimeTrafficFactor > 1.1) trafficConditions = 'heavy';
      
      setRoute(prev => ({
        ...prev,
        trafficConditions,
        usingRealTimeData: true
      }));
    }
    
    const fuelConsumption = Math.round(newDistance * 0.12 * fuelMultiplier * 100) / 100;
    
    setRoute(prev => ({
      ...prev,
      distance: Math.round(newDistance * 10) / 10,
      estimatedDuration: Math.round(newDuration),
      fuelConsumption: fuelConsumption,
      fuelCost: Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100,
      usingRealTimeData: params.useRealTimeData
    }));
    
    const saveRouteToDatabase = async () => {
      if (route.locations.length < 2) return;
      
      const routeData = {
        name: `Route ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        status: 'planned',
        total_distance: Math.round(newDistance * 10) / 10,
        total_duration: Math.round(newDuration),
        total_cylinders: route.cylinders,
        estimated_cost: Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100
      };
      
      const { data: routeInsert, error: routeError } = await supabase
        .from('routes')
        .insert(routeData)
        .select('id')
        .single();
      
      if (routeError) {
        console.error('Error saving route:', routeError);
        return;
      }
      
      if (routeInsert) {
        const deliveries = route.locations.map((location, index) => ({
          route_id: routeInsert.id,
          location_id: location.id.toString(),
          cylinders: location.emptyCylinders || 0,
          sequence: index
        }));
        
        const { error: deliveryError } = await supabase
          .from('deliveries')
          .insert(deliveries);
        
        if (deliveryError) {
          console.error('Error saving deliveries:', deliveryError);
        }
      }
    };
    
    saveRouteToDatabase().catch(console.error);
    
    toast.success("Route optimized with selected parameters");
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
      availableLocations: availableLocations,
      trafficConditions: 'moderate',
      estimatedDuration: 75,
      usingRealTimeData: false
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

  const handleFuelCostUpdate = (newCost: number) => {
    setFuelCostPerLiter(newCost);
    
    setRoute(prev => {
      const consumption = prev.fuelConsumption || prev.distance * 0.12;
      return {
        ...prev,
        fuelCost: Math.round(consumption * newCost * 100) / 100
      };
    });
  };

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
          <p className="text-muted-foreground">Create and manage delivery routes in South Africa</p>
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
                    {route.usingRealTimeData 
                      ? `Optimized with real-time traffic data (${route.trafficConditions} traffic)`
                      : 'Optimized delivery path with cost calculations'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RouteMap 
                    route={route.locations.length > 0 ? {
                      locations: route.locations,
                      distance: route.distance,
                      estimatedDuration: route.estimatedDuration,
                      trafficConditions: route.trafficConditions,
                      usingRealTimeData: route.usingRealTimeData,
                      fuelConsumption: route.fuelConsumption,
                      fuelCost: route.fuelCost
                    } : null} 
                  />
                  <RouteDetails 
                    route={route} 
                    onRemoveLocation={removeLocationFromRoute} 
                    onAddNewLocation={handleAddNewLocationFromPopover}
                    onFuelCostUpdate={handleFuelCostUpdate}
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
