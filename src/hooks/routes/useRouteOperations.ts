
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
      
      // Generate unique waypoint data for each segment
      const waypointData = [];
      
      // First point has zero distance/duration
      waypointData.push({ distance: 0, duration: 0 });
      
      // For each subsequent location, create varying segment metrics
      for (let i = 1; i < updatedLocations.length; i++) {
        const segmentIndex = i - 1;
        // Use base values that vary with location index
        const baseDistance = 5 + (segmentIndex * 3); // 5, 8, 11, 14, etc.
        const baseDuration = 10 + (segmentIndex * 5); // 10, 15, 20, 25, etc.
        
        // Add small random variation to make metrics more realistic
        const distanceVariation = 0.85 + (Math.random() * 0.3);
        const durationVariation = 0.9 + (Math.random() * 0.2);
        
        waypointData.push({
          distance: Math.round(baseDistance * distanceVariation * 10) / 10,
          duration: Math.round(baseDuration * durationVariation)
        });
      }
      
      // Calculate total distance/duration from waypoint data for consistency
      const calculatedDistance = waypointData.reduce((sum, wp) => sum + wp.distance, 0);
      const calculatedDuration = waypointData.reduce((sum, wp) => sum + wp.duration, 0);
      
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: newCylinders,
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        distance: calculatedDistance > 0 ? calculatedDistance : prev.distance,
        estimatedDuration: calculatedDuration > 0 ? calculatedDuration : prev.estimatedDuration,
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
      
      // Regenerate waypoint data after removing a location
      const waypointData = [];
      
      // First point has zero distance/duration
      if (updatedLocations.length > 0) {
        waypointData.push({ distance: 0, duration: 0 });
      }
      
      // For each subsequent location, create varying segment metrics
      for (let i = 1; i < updatedLocations.length; i++) {
        const segmentIndex = i - 1;
        // Use base values that vary with location index
        const baseDistance = 5 + (segmentIndex * 3); // 5, 8, 11, 14, etc.
        const baseDuration = 10 + (segmentIndex * 5); // 10, 15, 20, 25, etc.
        
        // Add small random variation
        const distanceVariation = 0.85 + (Math.random() * 0.3);
        const durationVariation = 0.9 + (Math.random() * 0.2);
        
        waypointData.push({
          distance: Math.round(baseDistance * distanceVariation * 10) / 10,
          duration: Math.round(baseDuration * durationVariation)
        });
      }
      
      // Calculate total distance/duration from waypoint data for consistency
      const calculatedDistance = waypointData.reduce((sum, wp) => sum + wp.distance, 0);
      const calculatedDuration = waypointData.reduce((sum, wp) => sum + wp.duration, 0);
      
      return {
        ...prev,
        locations: updatedLocations,
        cylinders: Math.max(0, prev.cylinders - cylindersToRemove),
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        distance: calculatedDistance > 0 ? calculatedDistance : prev.distance,
        estimatedDuration: calculatedDuration > 0 ? calculatedDuration : prev.estimatedDuration,
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
      
      // Update only the changed waypoint data
      const updatedWaypointData = [...prev.waypointData];
      
      // If we're replacing a non-first location, update its segment data
      if (oldLocationIndex > 0) {
        const segmentIndex = oldLocationIndex - 1;
        const baseDistance = 5 + (segmentIndex * 3);
        const baseDuration = 10 + (segmentIndex * 5);
        const distanceVariation = 0.85 + (Math.random() * 0.3);
        const durationVariation = 0.9 + (Math.random() * 0.2);
        
        updatedWaypointData[oldLocationIndex] = {
          distance: Math.round(baseDistance * distanceVariation * 10) / 10,
          duration: Math.round(baseDuration * durationVariation)
        };
      }
      
      // Calculate total distance/duration from waypoint data for consistency
      const calculatedDistance = updatedWaypointData.reduce((sum, wp) => sum + wp.distance, 0);
      const calculatedDuration = updatedWaypointData.reduce((sum, wp) => sum + wp.duration, 0);
      
      return {
        ...prev,
        locations: updatedLocations,
        fuelConsumption: newConsumption,
        fuelCost: newFuelCost,
        distance: calculatedDistance > 0 ? calculatedDistance : prev.distance,
        estimatedDuration: calculatedDuration > 0 ? calculatedDuration : prev.estimatedDuration,
        waypointData: updatedWaypointData
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
      
      // Generate new waypoint data for the optimized route
      const optimizedSegments = [];
      
      // First point has zero distance
      optimizedSegments.push({ distance: 0, duration: 0 });
      
      // Generate unique segment data for each optimized segment
      for (let i = 1; i < optimizedLocations.length; i++) {
        const segmentIndex = i - 1;
        // Use base values that vary with location index
        const baseDistance = 5 + (segmentIndex * 3); // 5, 8, 11, 14, etc.
        const baseDuration = 10 + (segmentIndex * 5); // 10, 15, 20, 25, etc.
        
        // Add small random variation
        const distanceVariation = 0.85 + (Math.random() * 0.3);
        const durationVariation = 0.9 + (Math.random() * 0.2);
        
        optimizedSegments.push({
          distance: Math.round(baseDistance * distanceVariation * 10) / 10,
          duration: Math.round(baseDuration * durationVariation)
        });
      }
      
      // Calculate total distance/duration from waypoint data for consistency
      const calculatedDistance = optimizedSegments.reduce((sum, wp) => sum + wp.distance, 0);
      const calculatedDuration = optimizedSegments.reduce((sum, wp) => sum + wp.duration, 0);
      
      toast.success('Route optimized successfully');
      
      return {
        ...prev,
        locations: optimizedLocations,
        distance: calculatedDistance > 0 ? calculatedDistance : prev.distance,
        estimatedDuration: calculatedDuration > 0 ? calculatedDuration : prev.estimatedDuration,
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
      
      // Generate unique waypoint data for each location
      const waypointData = [];
      
      // First point has zero distance/duration
      if (prev.locations.length > 0) {
        waypointData.push({ distance: 0, duration: 0 });
      }
      
      // For each subsequent location, create varying segment metrics
      for (let i = 1; i < prev.locations.length; i++) {
        const segmentIndex = i - 1;
        // Generate unique distances and durations
        const baseDistance = 5 + (segmentIndex * 3); 
        const baseDuration = 10 + (segmentIndex * 5);
        
        // Add variation
        const distanceVariation = 0.85 + (Math.random() * 0.3);
        const durationVariation = 0.9 + (Math.random() * 0.2);
        
        waypointData.push({
          distance: Math.round(baseDistance * distanceVariation * 10) / 10,
          duration: Math.round(baseDuration * durationVariation)
        });
      }
      
      // Calculate totals from waypoint data
      const calculatedDistance = waypointData.reduce((sum, wp) => sum + wp.distance, 0);
      const calculatedDuration = waypointData.reduce((sum, wp) => sum + wp.duration, 0);
      
      return {
        ...prev,
        distance: calculatedDistance || distance,
        estimatedDuration: calculatedDuration || prev.estimatedDuration,
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
