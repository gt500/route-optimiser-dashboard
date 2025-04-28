import { useState } from 'react';
import { LocationType } from '@/types/location';
import { RouteState, OptimizationParams, VehicleConfigProps } from './types';
import { toast } from 'sonner';
import { calculateRouteFuelConsumption } from '@/utils/route/fuelUtils';

export const useRouteOperations = (
  route: RouteState,
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>,
  startLocation: LocationType | null,
  endLocation: LocationType | null,
  availableLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  vehicleConfig: VehicleConfigProps
) => {
  const addLocationToRoute = (location: LocationType & { cylinders?: number }) => {
    setRoute(prev => {
      const existingLocations = prev.locations;
      const updatedLocations = [...existingLocations];
      
      // Insert new location before the end location if it exists
      if (endLocation && updatedLocations.length > 0 && 
          updatedLocations[updatedLocations.length - 1].id === endLocation.id) {
        updatedLocations.splice(-1, 0, location);
      } else {
        updatedLocations.push(location);
      }

      // Calculate new cylinders count
      const newCylinders = prev.cylinders + (location.cylinders || 0);
      
      // Recalculate fuel consumption with updated route
      const newDistance = Math.max(0.1, prev.distance || 45.7); // Default to 45.7km if no distance is set
      const newConsumption = calculateRouteFuelConsumption(newDistance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      // Create segment data for new location
      const segmentData = updatedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
        // Evenly distribute distance and duration across segments
        const segmentDistance = newDistance / Math.max(1, updatedLocations.length - 1);
        const segmentDuration = (prev.estimatedDuration || 75) / Math.max(1, updatedLocations.length - 1);
        
        return {
          distance: segmentDistance,
          duration: segmentDuration
        };
      });
      
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: newCylinders,
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        waypointData: segmentData
      };
    });
    
    // Log successful addition
    console.log(`Added location ${location.name} to route with ${location.cylinders} cylinders`);
  };

  const removeLocationFromRoute = (locationId: string) => {
    setRoute(prev => {
      // Find the location to be removed and its cylinders
      const locationToRemove = prev.locations.find(loc => loc.id === locationId);
      const cylindersToRemove = locationToRemove?.cylinders || 0;
      const updatedLocations = prev.locations.filter(loc => loc.id !== locationId);
      
      // Recalculate fuel consumption with updated route
      const newConsumption = calculateRouteFuelConsumption(prev.distance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      // Update segment data
      const segmentData = updatedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
        // Evenly distribute distance and duration across segments
        const segmentDistance = prev.distance / Math.max(1, updatedLocations.length - 1);
        const segmentDuration = (prev.estimatedDuration || 75) / Math.max(1, updatedLocations.length - 1);
        
        return {
          distance: segmentDistance,
          duration: segmentDuration
        };
      });
      
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: Math.max(0, prev.cylinders - cylindersToRemove),
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        waypointData: segmentData
      };
    });
  };

  const replaceLocation = (oldLocationId: string, newLocationId: string) => {
    const newLocation = availableLocations.find(loc => loc.id === newLocationId);
    if (!newLocation) return;

    setRoute(prev => {
      const oldLocationIndex = prev.locations.findIndex(loc => loc.id === oldLocationId);
      if (oldLocationIndex === -1) return prev;
      
      const oldLocation = prev.locations[oldLocationIndex];
      const updatedLocations = [...prev.locations];
      
      // Preserve cylinders count from the old location
      const cylindersCount = oldLocation.type === 'Customer' 
        ? oldLocation.emptyCylinders 
        : oldLocation.fullCylinders;
      
      // Create new location with preserved values
      const locationWithCylinders = {
        ...newLocation,
        emptyCylinders: oldLocation.type === 'Customer' ? cylindersCount : newLocation.emptyCylinders,
        fullCylinders: oldLocation.type !== 'Customer' ? cylindersCount : newLocation.fullCylinders
      };
      
      updatedLocations[oldLocationIndex] = locationWithCylinders;
      
      // Recalculate consumption
      const newConsumption = calculateRouteFuelConsumption(prev.distance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      return {
        ...prev,
        locations: updatedLocations,
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost
      };
    });
  };

  const handleOptimize = (params: OptimizationParams = {
    prioritizeFuel: true,
    avoidTraffic: true,
    useRealTimeData: true,
    optimizeForDistance: true
  }) => {
    if (route.locations.length < 3) {
      toast.warning('Add at least 3 locations to optimize the route');
      return;
    }
    
    // Simple optimization just reorders the points between start and end
    setRoute(prev => {
      // Keep start and end points fixed
      const startPoint = prev.locations[0];
      const endPoint = prev.locations.length > 1 ? prev.locations[prev.locations.length - 1] : null;
      
      // Get middle points
      let middlePoints = prev.locations.slice(1, endPoint ? -1 : undefined);
      
      // Simple random shuffle for demonstration (a real optimization would use algorithms)
      middlePoints = [...middlePoints].sort(() => Math.random() - 0.5);
      
      // Reassemble the route
      let optimizedLocations = [startPoint, ...middlePoints];
      if (endPoint) optimizedLocations.push(endPoint);
      
      // Create new segment data for the optimized route
      const optimizedSegments = optimizedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
        // Evenly distribute metrics across segments for now
        const segmentDistance = prev.distance / Math.max(1, optimizedLocations.length - 1);
        const segmentDuration = (prev.estimatedDuration || 75) / Math.max(1, optimizedLocations.length - 1);
        
        return {
          distance: segmentDistance,
          duration: segmentDuration
        };
      });
      
      toast.success('Route optimized successfully');
      
      return {
        ...prev,
        locations: optimizedLocations,
        waypointData: optimizedSegments
      };
    });
  };

  const updateRouteCosts = (distance: number) => {
    if (distance <= 0) {
      distance = 0.1; // Set minimum to avoid division by zero
    }
    
    const consumption = calculateRouteFuelConsumption(distance, route.locations);
    const fuelCost = consumption * vehicleConfig.fuelPrice;
    const maintenanceCost = distance * vehicleConfig.maintenanceCost;
    
    // Create segment data
    const segmentData = route.locations.map((_, index) => {
      if (index === 0) return { distance: 0, duration: 0 };
      
      // Evenly distribute costs across segments
      const segmentDistance = distance / Math.max(1, route.locations.length - 1);
      const segmentDuration = (route.estimatedDuration || 75) / Math.max(1, route.locations.length - 1);
      
      return {
        distance: segmentDistance,
        duration: segmentDuration
      };
    });
    
    setRoute(prev => ({
      ...prev,
      distance,
      fuelConsumption: consumption,
      fuelCost,
      maintenanceCost,
      totalCost: fuelCost + maintenanceCost,
      waypointData: segmentData
    }));
  };

  return {
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    updateRouteCosts,
    replaceLocation
  };
};
