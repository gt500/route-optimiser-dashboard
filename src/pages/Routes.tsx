
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Map, TruckIcon, RotateCw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Simulated route map component
const RouteMap = () => {
  return (
    <div className="h-[400px] bg-gray-100 rounded-lg relative overflow-hidden border border-border">
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        <div className="text-center space-y-3">
          <Map className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Map visualization will appear here</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">Select locations and define a route to see the optimized path</p>
        </div>
      </div>
    </div>
  );
};

// Route details component
const RouteDetails = ({ route }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.distance} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.fuelConsumption} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {route.fuelCost}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cylinders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.cylinders}/80</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TruckIcon className="h-5 w-5 text-muted-foreground" />
          <div className="font-medium">Route Stops</div>
        </div>
        
        <div className="space-y-3">
          {route.locations.map((location, index) => (
            <div key={index} className="flex items-center gap-3 bg-background rounded-lg p-3 relative">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-medium">{location.name}</div>
                <div className="text-xs text-muted-foreground">{location.address}</div>
              </div>
              <div className="ml-auto text-sm font-medium flex items-center gap-2">
                <Badge variant="outline">{location.cylinders} cylinders</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Routes = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  // Sample route data
  const sampleRoute = {
    distance: 45.7,
    fuelConsumption: 5.48,
    fuelCost: 120.29,
    cylinders: 58,
    locations: [
      { name: 'Warehouse', address: '123 Main St, Cape Town', cylinders: 0 },
      { name: 'Restaurant A', address: '456 Beach Rd, Sea Point', cylinders: 12 },
      { name: 'Hotel B', address: '789 Mountain View, Camps Bay', cylinders: 15 },
      { name: 'Restaurant C', address: '101 Long St, City Center', cylinders: 8 },
      { name: 'Hotel D', address: '234 Kloof St, Gardens', cylinders: 23 }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Route Optimizer</h1>
          <p className="text-muted-foreground">Create and manage delivery routes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Route
        </Button>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Route</TabsTrigger>
          <TabsTrigger value="active">Active Routes</TabsTrigger>
          <TabsTrigger value="history">Route History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Create New Route</CardTitle>
              <CardDescription>
                Define a new delivery route with multiple locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Starting Location</Label>
                  <Input id="start" placeholder="Warehouse, Cape Town" />
                </div>
                <div>
                  <Label htmlFor="end">End Location</Label>
                  <Input id="end" placeholder="Warehouse, Cape Town" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Selected Locations</Label>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Plus className="h-3 w-3" /> Add Location
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                  {sampleRoute.locations.slice(1, -1).map((location, index) => (
                    <div key={index} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-muted-foreground">{location.address}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <Badge variant="outline">{location.cylinders} cylinders</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Load Calculation</div>
                    <div className="text-sm text-muted-foreground">
                      58 cylinders (1,276 kg) of 80 max (1,760 kg)
                    </div>
                  </div>
                </div>
                <div className="w-24 h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(58/80)*100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button className="gap-2">
                  <RotateCw className="h-4 w-4" />
                  Optimize Route
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Route Preview</CardTitle>
              <CardDescription>
                Optimized delivery path with cost calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RouteMap />
              <RouteDetails route={sampleRoute} />
            </CardContent>
          </Card>
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
              <div className="text-center py-8 text-muted-foreground">
                No active routes at the moment
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
              <div className="text-center py-8 text-muted-foreground">
                No route history available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Routes;
