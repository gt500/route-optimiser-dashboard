
import { useState } from 'react';
import { LocationType } from '@/types/location';
import { RouteState, OptimizationParams, VehicleConfigProps } from './types';
import { toast } from 'sonner';

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
      if (endLocation) {
        updatedLocations.splice(-1, 0, location);
      } else {
        updatedLocations.push(location);
      }

      // Calculate new cylinders count
      const newCylinders = prev.cylinders + (location.cylinders || 0);
      
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: newCylinders
      };
    });
  };

  const removeLocationFromRoute = (locationId: string) => {
    setRoute(prev => {
      // Find the location to be removed and its cylinders
      const locationToRemove = prev.locations.find(loc => loc.id === locationId);
      const cylindersToRemove = locationToRemove?.cylinders || 0;
      
      return {
        ...prev,
        locations: prev.locations.filter(loc => loc.id !== locationId),
        cylinders: Math.max(0, prev.cylinders - cylindersToRemove)
      };
    });
  };

  const replaceLocation = (oldLocationId: string, newLocationId: string) => {
    const newLocation = availableLocations.find(loc => loc.id === newLocationId);
    if (!newLocation) return;

    setRoute(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === oldLocationId ? newLocation : loc
      )
    }));
  };

  const handleOptimize = (params: OptimizationParams) => {
    // Add optimization logic here if needed
    toast.success('Route optimized successfully');
  };

  const updateRouteCosts = (distance: number) => {
    if (distance <= 0) return;
    
    const consumption = (distance * vehicleConfig.fuelPrice * 0.12) / 21.95;
    const fuelCost = consumption * vehicleConfig.fuelPrice;
    const maintenanceCost = distance * vehicleConfig.maintenanceCost;
    
    setRoute(prev => ({
      ...prev,
      distance,
      fuelConsumption: consumption,
      fuelCost,
      maintenanceCost,
      totalCost: fuelCost + maintenanceCost
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
