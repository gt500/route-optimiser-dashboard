
import { LocationType } from '@/components/locations/LocationEditDialog';
import { useState } from 'react';
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
  
  const addLocationToRoute = (location: LocationType & { cylinders: number }) => {
    console.log("Adding location to route:", location.name, "with", location.cylinders, "cylinders");
    
    // Make sure we're adding exactly the specified number of cylinders
    const cylindersToAdd = location.cylinders || 0;
    
    setRoute(prev => {
      // Make sure we're not exceeding the total cylinder limit
      const currentCylinders = prev.locations.reduce((sum, loc) => 
        sum + (loc.emptyCylinders || 0), 0);
      
      const totalCylinders = currentCylinders + cylindersToAdd;
      
      if (totalCylinders > vehicleConfig.maxCylinders) {
        toast.warning(`Cannot add location - would exceed maximum cylinder load of ${vehicleConfig.maxCylinders}`);
        return prev;
      }
      
      // Create a copy with the correct cylinder count
      const locationWithCylinders = {
        ...location,
        emptyCylinders: cylindersToAdd // Set the exact cylinder count
      };
      
      // Logic to add location to route
      const newLocations = [...prev.locations];
      
      if (endLocation) {
        // If we have an end location, insert before it
        const endIndex = newLocations.findIndex(loc => loc.id === endLocation.id);
        if (endIndex !== -1) {
          newLocations.splice(endIndex, 0, locationWithCylinders);
        } else {
          newLocations.push(locationWithCylinders);
        }
      } else {
        // No end location, just add to the end
        newLocations.push(locationWithCylinders);
      }
      
      console.log(`Added location with ${cylindersToAdd} cylinders. New total: ${totalCylinders} cylinders`);
      
      return {
        ...prev,
        locations: newLocations,
        cylinders: totalCylinders
      };
    });
  };
  
  // Include other methods from your useRouteOperations hook
  const removeLocationFromRoute = (locationId: string) => {
    console.log("Removing location:", locationId);
    
    setRoute(prev => {
      const locationToRemove = prev.locations.find(loc => loc.id === locationId);
      const cylindersToRemove = locationToRemove?.emptyCylinders || 0;
      
      const newLocations = prev.locations.filter(loc => loc.id !== locationId);
      const newTotalCylinders = prev.cylinders - cylindersToRemove;
      
      console.log(`Removed location with ${cylindersToRemove} cylinders. New total: ${newTotalCylinders} cylinders`);
      
      return {
        ...prev,
        locations: newLocations,
        cylinders: newTotalCylinders
      };
    });
  };

  const handleOptimize = (params: OptimizationParams = {
    prioritizeFuel: true,
    avoidTraffic: true,
    useRealTimeData: true,
    optimizeForDistance: true
  }) => {
    console.log("Optimizing route with params:", params);

    setRoute(prevRoute => {
      // Clone the locations array to avoid modifying the original directly
      const optimizedLocations = [...prevRoute.locations];

      // Basic optimization: sort locations by name
      optimizedLocations.sort((a, b) => a.name.localeCompare(b.name));

      // Ensure start and end locations remain in their positions
      const startLocation = optimizedLocations.find(loc => loc.id === startLocation?.id);
      const endLocation = optimizedLocations.find(loc => loc.id === endLocation?.id);

      const filteredLocations = optimizedLocations.filter(loc =>
        loc.id !== startLocation?.id && loc.id !== endLocation?.id
      );

      // Reconstruct the route with start and end locations in place
      const newLocations = [
        ...(startLocation ? [startLocation] : []),
        ...filteredLocations,
        ...(endLocation ? [endLocation] : [])
      ];

      return {
        ...prevRoute,
        locations: newLocations
      };
    });
  };

  const updateRouteCosts = (distance: number = 0) => {
    setRoute(prev => {
      const consumption = (distance * vehicleConfig.fuelPrice * 0.12) / 21.95;
      const cost = consumption * vehicleConfig.fuelPrice;

      return {
        ...prev,
        distance: distance,
        fuelConsumption: consumption,
        fuelCost: cost
      };
    });
  };
  
  const replaceLocation = (oldLocationId: string, newLocationId: string) => {
    console.log(`Replacing location ${oldLocationId} with ${newLocationId}`);
    
    setRoute(prev => {
      const newLocations = prev.locations.map(loc => {
        if (loc.id === oldLocationId) {
          const newLocation = availableLocations.find(newLoc => newLoc.id === newLocationId);
          if (newLocation) {
            return {
              ...newLocation,
              emptyCylinders: loc.emptyCylinders || 0 // Keep existing cylinder count
            };
          }
        }
        return loc;
      });
      
      return {
        ...prev,
        locations: newLocations
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
