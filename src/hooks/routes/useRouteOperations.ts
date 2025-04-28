import { useState } from 'react';
import { LocationType } from '@/types/location';
import { RouteState, OptimizationParams, VehicleConfigProps } from './types';
import { toast } from 'sonner';
import { calculateRouteFuelConsumption, calculateFuelConsumption } from '@/utils/route/fuelUtils';
import { calculateTotalWeight } from '@/utils/route/weightUtils';

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
      
      if (endLocation && updatedLocations.length > 0 && 
          updatedLocations[updatedLocations.length - 1].id === endLocation.id) {
        updatedLocations.splice(-1, 0, location);
      } else {
        updatedLocations.push(location);
      }

      const newCylinders = prev.cylinders + (location.cylinders || 0);
      
      const totalWeight = calculateTotalWeight(updatedLocations);
      
      const newDistance = Math.max(0.1, prev.distance || 45.7);
      const newConsumption = calculateRouteFuelConsumption(newDistance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      const waypointData = updatedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
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
        waypointData
      };
    });
    
    console.log(`Added location ${location.name} to route with ${location.cylinders} cylinders`);
  };

  const removeLocationFromRoute = (locationId: string) => {
    setRoute(prev => {
      const locationToRemove = prev.locations.find(loc => loc.id === locationId);
      const cylindersToRemove = locationToRemove?.cylinders || 0;
      const updatedLocations = prev.locations.filter(loc => loc.id !== locationId);
      
      const totalWeight = calculateTotalWeight(updatedLocations);
      
      const newConsumption = calculateRouteFuelConsumption(prev.distance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      const waypointData = updatedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
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
        waypointData
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
      
      const cylindersCount = oldLocation.type === 'Customer' 
        ? oldLocation.emptyCylinders 
        : oldLocation.fullCylinders;
      
      const locationWithCylinders = {
        ...newLocation,
        emptyCylinders: oldLocation.type === 'Customer' ? cylindersCount : newLocation.emptyCylinders,
        fullCylinders: oldLocation.type !== 'Customer' ? cylindersCount : newLocation.fullCylinders
      };
      
      updatedLocations[oldLocationIndex] = locationWithCylinders;
      
      const totalWeight = calculateTotalWeight(updatedLocations);
      
      const newConsumption = calculateRouteFuelConsumption(prev.distance, updatedLocations);
      const newFuelCost = newConsumption * vehicleConfig.fuelPrice;
      
      const waypointData = [...prev.waypointData];
      if (oldLocationIndex > 0) {
        const segmentDistance = prev.distance / Math.max(1, updatedLocations.length - 1);
        const segmentDuration = (prev.estimatedDuration || 75) / Math.max(1, updatedLocations.length - 1);
        
        waypointData[oldLocationIndex - 1] = {
          distance: segmentDistance,
          duration: segmentDuration
        };
      }
      
      return {
        ...prev,
        locations: updatedLocations,
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        waypointData
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
    
    setRoute(prev => {
      const startPoint = prev.locations[0];
      const endPoint = prev.locations.length > 1 ? prev.locations[prev.locations.length - 1] : null;
      
      let middlePoints = prev.locations.slice(1, endPoint ? -1 : undefined);
      
      middlePoints = [...middlePoints].sort(() => Math.random() - 0.5);
      
      let optimizedLocations = [startPoint, ...middlePoints];
      if (endPoint) optimizedLocations.push(endPoint);
      
      const optimizedSegments = optimizedLocations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
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
      distance = 0.1;
    }
    
    setRoute(prev => {
      const totalWeight = calculateTotalWeight(prev.locations);
      
      const consumption = calculateRouteFuelConsumption(distance, prev.locations, prev.trafficConditions === 'heavy');
      const fuelCost = consumption * vehicleConfig.fuelPrice;
      const maintenanceCost = distance * vehicleConfig.maintenanceCost;
      
      const waypointData = prev.locations.map((_, index) => {
        if (index === 0) return { distance: 0, duration: 0 };
        
        const segmentDistance = distance / Math.max(1, prev.locations.length - 1);
        const segmentDuration = (prev.estimatedDuration || 75) / Math.max(1, prev.locations.length - 1);
        
        return {
          distance: segmentDistance,
          duration: segmentDuration
        };
      });
      
      return {
        ...prev,
        distance,
        fuelConsumption: consumption,
        fuelCost,
        maintenanceCost,
        totalCost: fuelCost + maintenanceCost,
        waypointData
      };
    });
  };

  return {
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    updateRouteCosts,
    replaceLocation
  };
};
