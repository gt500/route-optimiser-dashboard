
import { useState, useCallback } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState } from './types';
import { toast } from 'sonner';
import { calculateRouteMetrics } from '@/utils/route/routeCalculationService';

export const useRouteHandlers = (
  route: RouteState,
  setRoute: (fn: (route: RouteState) => RouteState) => void,
  startLocation: LocationType | null,
  setStartLocation: (location: LocationType | null) => void,
  endLocation: LocationType | null,
  setEndLocation: (location: LocationType | null) => void,
  availableLocations: LocationType[],
  setAvailableLocations: (locations: LocationType[]) => void,
  vehicleConfig: any,
  setIsLoadConfirmed: (isConfirmed: boolean) => void,
  updateVehicleConfig: (config: any) => void
) => {

  // Start location change handler
  const handleStartLocationChange = useCallback((locationId: string) => {
    // Find the location in available locations
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    
    if (location) {
      setStartLocation(location);
      console.log(`Start location set to ${location.name}`);
    }
  }, [availableLocations, setStartLocation]);

  // End location change handler
  const handleEndLocationChange = useCallback((locationId: string) => {
    // Find the location in available locations
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    
    if (location) {
      setEndLocation(location);
      console.log(`End location set to ${location.name}`);
    }
  }, [availableLocations, setEndLocation]);

  // Create a new route handler
  const handleCreateNewRoute = useCallback(() => {
    // Reset route state
    setRoute(prev => ({
      ...prev,
      distance: 0,
      fuelConsumption: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      totalCost: 0,
      cylinders: 0,
      locations: [],
      trafficConditions: 'moderate',
      estimatedDuration: 0,
      waypointData: []
    }));
    
    // Reset start and end locations
    setStartLocation(null);
    setEndLocation(null);
    
    // Reset load confirmation
    setIsLoadConfirmed(false);
    
    toast.success("New route created");
  }, [setRoute, setStartLocation, setEndLocation, setIsLoadConfirmed]);

  // Update fuel cost handler
  const handleFuelCostUpdate = useCallback((newCost: number) => {
    updateVehicleConfig({
      ...vehicleConfig,
      fuelPrice: newCost
    });
    
    // Recalculate fuel costs
    setRoute(prev => ({
      ...prev,
      fuelCost: prev.fuelConsumption * newCost,
      totalCost: prev.maintenanceCost + (prev.fuelConsumption * newCost)
    }));
    
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  }, [vehicleConfig, updateVehicleConfig, setRoute]);

  // Handle route data updates (from routing service or manual)
  const handleRouteDataUpdate = useCallback(async (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => {
    // Ensure we have all locations with coordinates
    const routeLocationsWithCoords = route.locations.map(loc => ({
      latitude: loc.lat || 0,
      longitude: loc.long || 0,
      name: loc.name,
      id: loc.id
    }));
    
    // If we have start and end locations, add them to the computation
    let fullRoutePoints = [...routeLocationsWithCoords];
    if (startLocation && startLocation.lat && startLocation.long) {
      fullRoutePoints.unshift({
        latitude: startLocation.lat,
        longitude: startLocation.long,
        name: startLocation.name,
        id: startLocation.id
      });
    }
    if (endLocation && endLocation.lat && endLocation.long) {
      fullRoutePoints.push({
        latitude: endLocation.lat,
        longitude: endLocation.long,
        name: endLocation.name,
        id: endLocation.id
      });
    }
    
    // Calculate route metrics if we don't have waypointData
    if (!waypointData && fullRoutePoints.length >= 2) {
      try {
        console.log("Calculating route metrics for path with", fullRoutePoints.length, "points");
        const routeMetrics = await calculateRouteMetrics(fullRoutePoints);
        
        if (routeMetrics) {
          distance = routeMetrics.totalDistance;
          duration = routeMetrics.totalDuration;
          waypointData = routeMetrics.segments;
          trafficConditions = routeMetrics.trafficConditions;
          console.log("Route calculation complete:", {
            distance,
            duration,
            segments: waypointData.length,
            traffic: trafficConditions
          });
        }
      } catch (error) {
        console.error("Error calculating route metrics:", error);
      }
    }
    
    // Update route with new data
    setRoute(prev => {
      // Calculate fuel consumption based on distance
      const fuelConsumption = Math.max(0, distance * 0.12);
      const fuelCost = fuelConsumption * vehicleConfig.fuelPrice;
      const maintenanceCost = Math.max(0, distance * 0.85);
      
      // Calculate cylinders if necessary
      const totalCylinders = prev.locations.reduce((sum, loc) => {
        return sum + (loc.emptyCylinders || loc.cylinders || 0);
      }, 0);
      
      // Prepare updated locations with segment data
      const updatedLocations = [...prev.locations];
      
      if (waypointData && waypointData.length > 0) {
        // Associate segment data with locations (skip first point which has zero distance)
        for (let i = 0; i < updatedLocations.length; i++) {
          const waypointIndex = i + 1; // +1 because first waypoint is for start location
          if (waypointData[waypointIndex]) {
            updatedLocations[i] = {
              ...updatedLocations[i],
              segmentDistance: waypointData[waypointIndex].distance,
              segmentDuration: waypointData[waypointIndex].duration,
              segmentCost: (waypointData[waypointIndex].distance * vehicleConfig.fuelPrice * 0.12).toFixed(2)
            };
          }
        }
      }
      
      return {
        ...prev,
        distance,
        estimatedDuration: duration,
        fuelConsumption,
        fuelCost,
        maintenanceCost,
        totalCost: fuelCost + maintenanceCost,
        cylinders: totalCylinders,
        trafficConditions: trafficConditions || prev.trafficConditions,
        waypointData: waypointData || prev.waypointData,
        locations: updatedLocations
      };
    });
  }, [route.locations, startLocation, endLocation, setRoute, vehicleConfig.fuelPrice]);

  // Add a new location from a popover
  const handleAddNewLocationFromPopover = useCallback((locationId: string | number) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    
    if (location) {
      // Add the location to the route (with default 1 cylinder)
      setRoute(prev => ({
        ...prev,
        locations: [
          ...prev.locations,
          {
            ...location,
            cylinders: 1,
            emptyCylinders: 1
          }
        ]
      }));
      
      toast.success(`Added ${location.name} to route`);
    }
  }, [availableLocations, setRoute]);

  // Update all locations
  const handleUpdateLocations = useCallback((newLocations: LocationType[]) => {
    setAvailableLocations(newLocations);
  }, [setAvailableLocations]);

  return {
    handleStartLocationChange,
    handleEndLocationChange,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
    handleUpdateLocations,
  };
};
