
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Clock, Navigation, Car, DollarSign, Package, Trash2, ArrowUpDown, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { calculateDistance } from '@/utils/routeUtils';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import RouteMetricsCard from './metrics/RouteMetricsCard';

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
  const [locationCosts, setLocationCosts] = useState<LocationCost[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [totalCylinders, setTotalCylinders] = useState(0);
  const [totalExchangedCylinders, setTotalExchangedCylinders] = useState(0);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // Fixed values for the vehicle configuration
  const vehicleConfig = {
    baseConsumption: 12, // L/100km
    fuelPrice: 22, // R per liter
    maintenanceCostPerKm: 0.35 // R per km
  };
  
  // Average driving speed in km/h for time estimation
  const AVG_SPEED = 40;
  
  useEffect(() => {
    const costs: LocationCost[] = [];
    let totalDist = 0;
    let totalCost = 0;
    let totalTime = 0;
    let totalCyls = 0;
    let totalExchanged = 0;

    route.locations.forEach((location, index) => {
      totalCyls += location.emptyCylinders || 0;
      totalExchanged += location.fullCylinders || 0;
      
      if (index > 0) {
        const prevLocation = route.locations[index - 1];
        const distance = calculateDistance(
          prevLocation.lat || 0,
          prevLocation.long || 0,
          location.lat || 0,
          location.long || 0
        );

        const fuelCost = (distance * vehicleConfig.baseConsumption / 100) * vehicleConfig.fuelPrice;
        const maintenanceCost = distance * vehicleConfig.maintenanceCostPerKm;
        // Calculate estimated time in minutes
        const estimatedTimeMin = Math.round((distance / AVG_SPEED) * 60);

        totalDist += distance;
        totalCost += fuelCost + maintenanceCost;
        totalTime += estimatedTimeMin;

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
    setTotalCost(totalCost);
    setTotalDistance(totalDist);
    setTotalEstimatedTime(totalTime);
    setTotalCylinders(totalCyls);
    setTotalExchangedCylinders(totalExchanged);
  }, [route.locations]);

  const handleMoveUp = (index: number) => {
    if (index <= 1) return; // Cannot move up the first stop (depot) or second stop
    // Implement reordering logic here if needed
  };

  const handleMoveDown = (index: number) => {
    if (index >= route.locations.length - 2 || index === 0) return; // Cannot move down the last stop or depot
    // Implement reordering logic here if needed
  };

  // Format time display for metrics card
  const formatTime = (minutes: number) => {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Route Details</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDetailedView(true)}
          >
            <Map className="h-4 w-4 mr-2" />
            View Full Route
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Metrics cards at the top */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <RouteMetricsCard 
              title="Distance" 
              value={`${totalDistance.toFixed(1)} km`}
              icon={<Navigation className="h-4 w-4" />}
              bgColor="bg-green-600"
              tooltip="Total route distance in kilometers"
            />
            
            <RouteMetricsCard 
              title="Journey Time" 
              value={formatTime(totalEstimatedTime)}
              icon={<Clock className="h-4 w-4" />}
              bgColor="bg-blue-600"
              tooltip="Estimated total journey time"
            />
            
            <RouteMetricsCard 
              title="Total Cost" 
              value={`R${totalCost.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4" />}
              bgColor="bg-orange-600"
              tooltip="Combined fuel and maintenance costs"
            />
            
            <RouteMetricsCard 
              title="Cylinders" 
              value={totalCylinders.toString()}
              icon={<Package className="h-4 w-4" />}
              bgColor="bg-purple-600"
              subtitle={totalCylinders > 80 ? "Over capacity!" : undefined}
              tooltip="Total number of cylinders in this route"
            />
          </div>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2 relative">
              {/* Draw vertical route line connecting stops */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
              
              {locationCosts.map((item, index) => (
                <Card key={`${item.location.id}-${index}`} className="p-4 relative z-10">
                  <div className="flex items-start gap-3">
                    {/* Stop marker with number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.location.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.location.address}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.location.emptyCylinders && item.location.emptyCylinders > 0 && (
                              <Badge variant="outline" className="text-sm bg-blue-50 dark:bg-blue-900/20">
                                <Package className="h-3 w-3 mr-1" />
                                Cylinders: {item.location.emptyCylinders}
                              </Badge>
                            )}
                            {item.location.fullCylinders && item.location.fullCylinders > 0 && (
                              <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-900/20">
                                <Package className="h-3 w-3 mr-1" />
                                Storage: {item.location.fullCylinders}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {index > 0 && (
                          <div className="text-right text-xs">
                            <div className="flex items-center justify-end gap-1 text-muted-foreground mb-1">
                              <Navigation className="h-3 w-3" />
                              <span>{item.distanceFromPrev.toFixed(1)} km</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-muted-foreground mb-1">
                              <Clock className="h-3 w-3" />
                              <span>{item.estimatedTimeMin} min</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>R{(item.fuelCost + item.maintenanceCost).toFixed(2)}</span>
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
                        className="h-6 w-6" 
                        onClick={() => handleMoveUp(index)}
                        disabled={index <= 1}
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-180" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleMoveDown(index)}
                        disabled={index >= route.locations.length - 2}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
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

          {totalCylinders > 80 && (
            <div className="bg-red-500 text-white p-2 text-center rounded">
              Warning: Load Exceeded - Maximum 80 cylinders allowed
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detailed Route View Dialog */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Complete Route Details</DialogTitle>
            <DialogDescription>
              Full breakdown of your delivery route with {locationCosts.length} stops
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
                      <div className="text-right font-medium">{totalDistance.toFixed(1)} km</div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Estimated Time</span>
                      </div>
                      <div className="text-right font-medium">
                        {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span>Fuel Consumption</span>
                      </div>
                      <div className="text-right font-medium">
                        {((totalDistance * vehicleConfig.baseConsumption) / 100).toFixed(1)} L
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>Total Cost</span>
                      </div>
                      <div className="text-right font-medium">R{totalCost.toFixed(2)}</div>
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
                      <div className="text-right font-medium">{totalCylinders}</div>
                      
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                        <span>Exchanged Cylinders</span>
                      </div>
                      <div className="text-right font-medium">{totalExchangedCylinders}</div>
                      
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-primary" />
                        <span>Stops</span>
                      </div>
                      <div className="text-right font-medium">{locationCosts.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Stop-by-Stop Details</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  {locationCosts.map((item, index) => (
                    <AccordionItem key={`detailed-${item.location.id}-${index}`} value={`stop-${index}`}>
                      <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-medium">{item.location.name}</span>
                          {index > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({item.distanceFromPrev.toFixed(1)} km)
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3">
                        <div className="grid md:grid-cols-2 gap-4 py-2">
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-sm font-medium">Address</h4>
                              <p className="text-sm text-muted-foreground">{item.location.address || "No address available"}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Coordinates</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.location.lat}, {item.location.long}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Type</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.location.type || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {index > 0 && (
                              <>
                                <div>
                                  <h4 className="text-sm font-medium">Distance from Previous</h4>
                                  <p className="text-sm text-muted-foreground">{item.distanceFromPrev.toFixed(1)} km</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Estimated Travel Time</h4>
                                  <p className="text-sm text-muted-foreground">{item.estimatedTimeMin} minutes</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Cost to This Stop</h4>
                                  <p className="text-sm text-muted-foreground">
                                    R{(item.fuelCost + item.maintenanceCost).toFixed(2)}
                                    <span className="text-xs ml-1">
                                      (Fuel: R{item.fuelCost.toFixed(2)}, Maintenance: R{item.maintenanceCost.toFixed(2)})
                                    </span>
                                  </p>
                                </div>
                              </>
                            )}
                            <div>
                              <h4 className="text-sm font-medium">Cylinder Quantities</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.location.type === 'Customer' && item.location.emptyCylinders && item.location.emptyCylinders > 0 && (
                                  <Badge variant="outline" className="text-sm bg-blue-50 dark:bg-blue-900/20">
                                    <Package className="h-3 w-3 mr-1" />
                                    Cylinders: {item.location.emptyCylinders}
                                  </Badge>
                                )}
                                {item.location.type === 'Storage' && item.location.fullCylinders && item.location.fullCylinders > 0 && (
                                  <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-900/20">
                                    <Package className="h-3 w-3 mr-1" />
                                    Storage: {item.location.fullCylinders}
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
    </>
  );
};

export default RouteDetails;
