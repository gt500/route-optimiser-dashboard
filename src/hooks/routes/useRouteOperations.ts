
import { LocationType } from '@/components/locations/LocationEditDialog';
import { optimizeLocationOrder, calculateRouteMetrics } from '@/utils/routeUtils';
import { RouteState, OptimizationParams, routeOptimizationDefaultParams, MAX_CYLINDERS } from './types';
import { toast } from 'sonner';

export const useRouteOperations = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  startLocation: LocationType | null,
  endLocation: LocationType | null,
  availableLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  vehicleConfig: { fuelPrice: number }
) => {
  const addLocationToRoute = (location: LocationType & { cylinders: number }) => {
    console.log("Adding location to route:", location);
    
    const locationWithCylinders = {
      ...location,
      id: location.id.toString(),
      emptyCylinders: location.cylinders,
      cylinders: location.cylinders
    };
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      
      if (endLocation && newLocations.length > 1) {
        newLocations.splice(newLocations.length - 1, 0, locationWithCylinders);
      } else {
        newLocations.push(locationWithCylinders);
      }
      
      console.log("Updated route locations after add:", newLocations);
      
      const newTotalCylinders = newLocations.reduce((sum, loc) => 
        sum + (loc.emptyCylinders || 0), 0);
      
      const newRouteState = {
        ...prev,
        cylinders: newTotalCylinders,
        locations: newLocations
      };
      
      return newRouteState;
    });
    
    setAvailableLocations(prev => 
      prev.filter(loc => loc.id.toString() !== location.id.toString())
    );
  };

  const removeLocationFromRoute = (index: number) => {
    console.log("Removing location at index:", index);
    if (index === 0 || (endLocation && index === route.locations.length - 1)) return;
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      const removedLocation = newLocations[index];
      newLocations.splice(index, 1);
      
      console.log("Updated route locations after remove:", newLocations);
      
      setAvailableLocations(prevAvailable => [...prevAvailable, removedLocation]);
      
      const newTotalCylinders = newLocations.reduce((sum, loc) => 
        sum + (loc.emptyCylinders || 0), 0);
      
      return {
        ...prev,
        cylinders: newTotalCylinders,
        locations: newLocations
      };
    });
    
    toast.success("Location removed from route");
  };

  const handleOptimize = (params = routeOptimizationDefaultParams) => {
    console.log("Optimizing with params:", params);
    
    if (route.locations.length <= 2) {
      toast.info("Need at least 3 locations to optimize route");
      return;
    }
    
    const startLoc = route.locations[0];
    const endLoc = route.locations[route.locations.length - 1];
    let middleLocations = [...route.locations.slice(1, -1)];
    
    middleLocations = optimizeLocationOrder(startLoc, middleLocations, endLoc, params);
    
    const optimizedLocations = [
      startLoc,
      ...middleLocations,
      endLoc
    ];
    
    // Use accurate waypoint data if available
    const routingData = route.waypointData && route.waypointData.length > 0 ? {
      totalDistance: route.distance,
      totalDuration: route.estimatedDuration,
      waypointData: route.waypointData
    } : undefined;
    
    const metrics = calculateRouteMetrics(
      optimizedLocations, 
      params, 
      vehicleConfig.fuelPrice,
      routingData
    );
    
    setRoute(prev => ({
      ...prev,
      locations: optimizedLocations,
      distance: metrics.distance,
      estimatedDuration: metrics.duration,
      fuelConsumption: metrics.fuelConsumption,
      fuelCost: metrics.fuelCost,
      trafficConditions: metrics.trafficConditions,
      usingRealTimeData: params.useRealTimeData,
      waypointData: metrics.waypointData || prev.waypointData
    }));
    
    toast.success(params.prioritizeFuel ? 
      "Route optimized for best fuel efficiency" : 
      (params.optimizeForDistance ? 
        "Route optimized for shortest distance" : 
        "Route optimized with selected parameters")
    );
  };

  const updateRouteCosts = (distance: number, fuelPrice?: number) => {
    const priceToUse = fuelPrice !== undefined ? fuelPrice : vehicleConfig.fuelPrice;
    
    // Calculate fuel consumption more accurately based on distance
    // Average truck fuel consumption is 12L/100km
    const fuelConsumption = (distance * 12) / 100; // Liters of fuel
    const fuelCost = fuelConsumption * priceToUse;
    const maintenanceCost = distance * 0.85; // R0.85 per km for maintenance
    const totalCost = fuelCost + maintenanceCost;
    
    console.log(`Updating route costs with: distance=${distance}, fuelPrice=${priceToUse}, consumption=${fuelConsumption}, cost=${fuelCost}`);
    
    setRoute(prev => ({
      ...prev,
      fuelConsumption,
      fuelCost,
      maintenanceCost,
      totalCost
    }));
    
    return { fuelConsumption, fuelCost, maintenanceCost, totalCost };
  };

  const handleReplaceLocation = (index: number, newLocationId: string) => {
    console.log(`Replacing location at index ${index} with location ID ${newLocationId}`);
    
    if (index === 0) {
      toast.error("Cannot replace the start location");
      return;
    }
    
    const newLocation = availableLocations.find(loc => loc.id.toString() === newLocationId);
    
    if (!newLocation) {
      toast.error("Selected location not found");
      return;
    }
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      const oldLocation = newLocations[index];
      
      const oldCylinders = oldLocation.type === 'Storage' 
        ? oldLocation.fullCylinders || 0 
        : oldLocation.emptyCylinders || 0;
      
      let newCylinders = 0;
      const locationType = newLocation.type || 'Customer';
      
      if (locationType === 'Storage') {
        newCylinders = newLocation.fullCylinders || 0;
      } else {
        newCylinders = newLocation.emptyCylinders || 10; // Default to 10 if not specified
      }
      
      const newTotalCylinders = prev.cylinders - oldCylinders + newCylinders;
      if (newTotalCylinders > MAX_CYLINDERS) {
        toast.error(`Weight limit exceeded! Replacing this location would exceed the maximum capacity of ${MAX_CYLINDERS} cylinders.`);
        return prev;
      }
      
      const locationWithCylinders = {
        ...newLocation,
        id: newLocation.id.toString(),
        emptyCylinders: locationType === 'Customer' ? newCylinders : 0,
        fullCylinders: locationType === 'Storage' ? newCylinders : 0,
        cylinders: newCylinders
      };
      
      newLocations[index] = locationWithCylinders;
      
      setAvailableLocations(prevAvailable => [...prevAvailable, oldLocation]);
      
      setAvailableLocations(prevAvailable => 
        prevAvailable.filter(loc => loc.id.toString() !== newLocationId)
      );
      
      return {
        ...prev,
        cylinders: newTotalCylinders,
        locations: newLocations
      };
    });
    
    toast.success("Location replaced successfully");
  };

  return {
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    updateRouteCosts,
    handleReplaceLocation
  };
};
