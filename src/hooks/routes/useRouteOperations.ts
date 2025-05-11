
import { LocationType } from '@/components/locations/LocationEditDialog';
import { useState } from 'react';
import { RouteState, OptimizationParams, VehicleConfigProps } from './types';
import { toast } from 'sonner';
import { optimizeLocationOrder } from '@/utils/route/optimizationUtils';

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

    // Check if we have enough locations to optimize
    if (route.locations.length <= 2) {
      toast.warning("Need at least 3 locations to optimize route");
      return;
    }

    setRoute(prevRoute => {
      // Get all locations excluding start and end (if they exist)
      let middleLocations = [...prevRoute.locations];
      let fixedStartLocation = null;
      let fixedEndLocation = null;

      // Extract start location if it exists
      if (startLocation) {
        const startIndex = middleLocations.findIndex(loc => loc.id === startLocation.id);
        if (startIndex !== -1) {
          fixedStartLocation = middleLocations[startIndex];
          middleLocations.splice(startIndex, 1);
        }
      }

      // Extract end location if it exists
      if (endLocation) {
        const endIndex = middleLocations.findIndex(loc => loc.id === endLocation.id);
        if (endIndex !== -1) {
          fixedEndLocation = middleLocations[endIndex];
          middleLocations.splice(endIndex, 1);
        }
      }

      // Use the optimization utility to reorder the middle locations
      const optimizedMiddle = optimizeLocationOrder(
        fixedStartLocation || middleLocations[0],
        middleLocations,
        fixedEndLocation || middleLocations[middleLocations.length - 1],
        params
      );

      // Reconstruct the route with start and end fixed in place
      const newLocations = [
        ...(fixedStartLocation ? [fixedStartLocation] : []),
        ...optimizedMiddle,
        ...(fixedEndLocation ? [fixedEndLocation] : [])
      ];

      toast.success("Route optimized successfully");

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
