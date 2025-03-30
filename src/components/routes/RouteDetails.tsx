
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LocationType } from '../locations/LocationEditDialog';
import RouteMetricsGrid from './metrics/RouteMetricsGrid';
import RouteStopsList from './stops/RouteStopsList';
import RouteActions from './RouteActions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Navigation, Car, DollarSign, Package, Trash2, ArrowUpDown, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateDistance } from '@/utils/routeUtils';

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
  onOptimize?: () => void;
  onSave?: () => void;
  isLoadConfirmed?: boolean;
}

interface LocationCost {
  location: LocationType;
  distanceFromPrev: number;
  fuelCost: number;
  maintenanceCost: number;
  estimatedTimeMin?: number;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ 
  route, 
  onRemoveLocation, 
  onAddNewLocation, 
  onFuelCostUpdate,
  onRouteDataUpdate,
  onOptimize,
  onSave,
  isLoadConfirmed = false
}) => {
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(22); // Default value
  const [routeDistance, setRouteDistance] = useState(route.distance);
  const [routeDuration, setRouteDuration] = useState(route.estimatedDuration || 0);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [locationCosts, setLocationCosts] = useState<LocationCost[]>([]);
  
  const maintenanceCostPerKm = 0.35; // R0.35 per km for maintenance
  
  useEffect(() => {
    if (route.distance > 0) {
      setRouteDistance(route.distance);
    }
    if (route.estimatedDuration && route.estimatedDuration > 0) {
      setRouteDuration(route.estimatedDuration);
    }
  }, [route.distance, route.estimatedDuration]);
  
  useEffect(() => {
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

  useEffect(() => {
    // Calculate costs for each location in the route
    const costs: LocationCost[] = [];
    
    route.locations.forEach((location, index) => {
      if (index > 0) {
        const prevLocation = route.locations[index - 1];
        const distance = calculateDistance(
          prevLocation.lat || 0,
          prevLocation.long || 0,
          location.lat || 0,
          location.long || 0
        );

        const fuelCost = (distance * 0.12) * fuelCostPerLiter;
        const maintenanceCost = distance * maintenanceCostPerKm;
        // Calculate estimated time in minutes based on average speed of 40km/h
        const estimatedTimeMin = Math.round((distance / 40) * 60);

        costs.push({
          location,
          distanceFromPrev: distance,
          fuelCost,
          maintenanceCost,
          estimatedTimeMin
        });
      } else {
        costs.push({
          location,
          distanceFromPrev: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          estimatedTimeMin: 0
        });
      }
    });
    
    setLocationCosts(costs);
  }, [route.locations, fuelCostPerLiter]);

  const handleFuelCostChange = (newCost: number) => {
    setFuelCostPerLiter(newCost);
    if (onFuelCostUpdate) {
      onFuelCostUpdate(newCost);
    }
  };
  
  const calculateFuelConsumption = () => {
    return routeDistance * 0.12; // 12L per 100km
  };
  
  const calculateFuelCost = () => {
    const consumption = calculateFuelConsumption();
    return consumption * fuelCostPerLiter;
  };
  
  const displayDistance = routeDistance > 0 ? routeDistance : route.distance;
  const displayDuration = routeDuration > 0 ? routeDuration : (route.estimatedDuration || Math.round(displayDistance * 1.5));
  const displayConsumption = calculateFuelConsumption() || route.fuelConsumption;
  const displayFuelCost = calculateFuelCost() || route.fuelCost;
  
  return (
    <div className="space-y-4">
      <RouteMetricsGrid
        distance={displayDistance}
        duration={displayDuration}
        fuelConsumption={displayConsumption}
        fuelCost={displayFuelCost}
        cylinders={route.cylinders}
        fuelCostPerLiter={fuelCostPerLiter}
        trafficConditions={route.trafficConditions}
        usingRealTimeData={route.usingRealTimeData}
        onFuelCostChange={handleFuelCostChange}
      />

      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Route Stops</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDetailedView(true)}
              disabled={route.locations.length < 2}
            >
              <Map className="h-4 w-4 mr-2" />
              View Full Route
            </Button>
          </div>
          
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-2 relative">
              {/* Draw vertical route line connecting stops */}
              {route.locations.length > 1 && (
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
              )}
              
              {locationCosts.map((locationCost, index) => (
                <Card key={`${locationCost.location.id}-${index}`} className="p-4 relative z-10">
                  <div className="flex items-start gap-3">
                    {/* Stop marker with number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{locationCost.location.name}</h4>
                          <p className="text-xs text-muted-foreground">{locationCost.location.address}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {locationCost.location.type === 'Customer' && locationCost.location.emptyCylinders && locationCost.location.emptyCylinders > 0 && (
                              <Badge variant="outline" className="text-sm bg-blue-50 dark:bg-blue-900/20">
                                <Package className="h-3 w-3 mr-1" />
                                Cylinders: {locationCost.location.emptyCylinders}
                              </Badge>
                            )}
                            {locationCost.location.type === 'Storage' && locationCost.location.fullCylinders && locationCost.location.fullCylinders > 0 && (
                              <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-900/20">
                                <Package className="h-3 w-3 mr-1" />
                                Storage: {locationCost.location.fullCylinders}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {index > 0 && (
                          <div className="text-right text-xs">
                            <div className="flex items-center justify-end gap-1 text-muted-foreground mb-1">
                              <Navigation className="h-3 w-3" />
                              <span>{locationCost.distanceFromPrev.toFixed(1)} km</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-muted-foreground mb-1">
                              <Clock className="h-3 w-3" />
                              <span>{locationCost.estimatedTimeMin} min</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>R{(locationCost.fuelCost + locationCost.maintenanceCost).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions for each stop - only show for non-depot locations */}
                  {index !== 0 && (
                    <div className="flex justify-end mt-2 gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                        onClick={() => onRemoveLocation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <RouteActions
        usingRealTimeData={route.usingRealTimeData}
        onOptimize={onOptimize}
        onSave={onSave}
        disabled={isLoadConfirmed || route.locations.length < 2}
      />
      
      {/* Detailed Route View Dialog */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Complete Route Details</DialogTitle>
            <DialogDescription>
              Full breakdown of your delivery route with {route.locations.length} stops
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Route Summary</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary" />
                        <span>Total Distance</span>
                      </div>
                      <div className="text-right font-medium">{displayDistance.toFixed(1)} km</div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Estimated Time</span>
                      </div>
                      <div className="text-right font-medium">
                        {Math.floor(displayDuration / 60)}h {displayDuration % 60}m
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span>Fuel Consumption</span>
                      </div>
                      <div className="text-right font-medium">
                        {displayConsumption.toFixed(1)} L
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>Total Cost</span>
                      </div>
                      <div className="text-right font-medium">R{displayFuelCost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Delivery Summary</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Total Cylinders</span>
                      </div>
                      <div className="text-right font-medium">{route.cylinders}</div>
                      
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-primary" />
                        <span>Stops</span>
                      </div>
                      <div className="text-right font-medium">{route.locations.length}</div>
                      
                      {route.trafficConditions && (
                        <>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <span>Traffic</span>
                          </div>
                          <div className="text-right font-medium capitalize">{route.trafficConditions}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Stop-by-Stop Details</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  {locationCosts.map((locationCost, index) => (
                    <AccordionItem key={`detailed-${locationCost.location.id}-${index}`} value={`stop-${index}`}>
                      <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-medium">{locationCost.location.name}</span>
                          {index > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({locationCost.distanceFromPrev.toFixed(1)} km)
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3">
                        <div className="grid md:grid-cols-2 gap-4 py-2">
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-sm font-medium">Address</h4>
                              <p className="text-sm text-muted-foreground">{locationCost.location.address || "No address available"}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Coordinates</h4>
                              <p className="text-sm text-muted-foreground">
                                {locationCost.location.lat}, {locationCost.location.long}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Type</h4>
                              <p className="text-sm text-muted-foreground">
                                {locationCost.location.type || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {index > 0 && (
                              <>
                                <div>
                                  <h4 className="text-sm font-medium">Distance from Previous</h4>
                                  <p className="text-sm text-muted-foreground">{locationCost.distanceFromPrev.toFixed(1)} km</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Estimated Travel Time</h4>
                                  <p className="text-sm text-muted-foreground">{locationCost.estimatedTimeMin} minutes</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Cost to This Stop</h4>
                                  <p className="text-sm text-muted-foreground">
                                    R{(locationCost.fuelCost + locationCost.maintenanceCost).toFixed(2)}
                                    <span className="text-xs ml-1">
                                      (Fuel: R{locationCost.fuelCost.toFixed(2)}, Maintenance: R{locationCost.maintenanceCost.toFixed(2)})
                                    </span>
                                  </p>
                                </div>
                              </>
                            )}
                            <div>
                              <h4 className="text-sm font-medium">Cylinder Quantities</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {locationCost.location.type === 'Customer' && locationCost.location.emptyCylinders && locationCost.location.emptyCylinders > 0 && (
                                  <Badge variant="outline" className="text-sm bg-blue-50 dark:bg-blue-900/20">
                                    <Package className="h-3 w-3 mr-1" />
                                    Cylinders: {locationCost.location.emptyCylinders}
                                  </Badge>
                                )}
                                {locationCost.location.type === 'Storage' && locationCost.location.fullCylinders && locationCost.location.fullCylinders > 0 && (
                                  <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-900/20">
                                    <Package className="h-3 w-3 mr-1" />
                                    Storage: {locationCost.location.fullCylinders}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setShowDetailedView(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteDetails;
