
import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { optimizeLocationOrder, calculateRouteMetrics, OptimizationParams } from '@/utils/routeUtils';
import { toast } from 'sonner';

export const routeOptimizationDefaultParams: OptimizationParams = {
  prioritizeFuel: true,
  avoidTraffic: true,
  useRealTimeData: false,
  optimizeForDistance: false
};

export const useRouteManagement = (initialLocations: LocationType[] = []) => {
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>(initialLocations);
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(22);
  const [isLoadConfirmed, setIsLoadConfirmed] = useState(false);
  const [isSyncingLocations, setSyncingLocations] = useState(true);
  
  const [route, setRoute] = useState({
    distance: 0,
    fuelConsumption: 0,
    fuelCost: 0,
    cylinders: 0,
    locations: [] as LocationType[],
    availableLocations: [] as LocationType[],
    trafficConditions: 'moderate' as 'light' | 'moderate' | 'heavy',
    estimatedDuration: 0,
    usingRealTimeData: false
  });
  
  // Synchronize locations with the database
  useEffect(() => {
    const syncLocationsWithDatabase = async () => {
      setSyncingLocations(true);
      try {
        const { data: existingLocations, error: fetchError } = await supabase
          .from('locations')
          .select('*');
          
        if (fetchError) {
          console.error('Error fetching locations:', fetchError);
          toast.error('Failed to sync locations with database');
          setSyncingLocations(false);
          return;
        }
        
        const existingLocationMap = new Map();
        if (existingLocations) {
          existingLocations.forEach(loc => {
            existingLocationMap.set(loc.name, loc);
          });
        }
        
        const locationsToInsert = [];
        
        for (const location of availableLocations) {
          if (!existingLocationMap.has(location.name)) {
            locationsToInsert.push({
              id: location.id.toString(),
              name: location.name,
              address: location.address,
              latitude: location.lat,
              longitude: location.long,
              open_time: '08:00',
              close_time: '18:00'
            });
          }
        }
        
        if (locationsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('locations')
            .insert(locationsToInsert);
            
          if (insertError) {
            console.error('Error inserting locations:', insertError);
            toast.error(`Failed to add ${locationsToInsert.length} locations to database`);
          } else {
            console.log(`Successfully added ${locationsToInsert.length} locations to database`);
            toast.success(`Synchronized ${locationsToInsert.length} locations with database`);
          }
        }
        
        if (existingLocations && existingLocations.length > 0) {
          const mergedLocations = [...availableLocations];
          
          existingLocations.forEach(dbLocation => {
            const existingIndex = mergedLocations.findIndex(loc => 
              loc.name === dbLocation.name || loc.id.toString() === dbLocation.id
            );
            
            if (existingIndex === -1) {
              mergedLocations.push({
                id: dbLocation.id,
                name: dbLocation.name,
                address: dbLocation.address,
                lat: dbLocation.latitude,
                long: dbLocation.longitude,
                type: 'Customer',
                emptyCylinders: 10
              });
            } else {
              mergedLocations[existingIndex] = {
                ...mergedLocations[existingIndex],
                id: dbLocation.id,
                lat: dbLocation.latitude,
                long: dbLocation.longitude
              };
            }
          });
          
          setAvailableLocations(mergedLocations);
        }
      } catch (error) {
        console.error('Error syncing locations:', error);
        toast.error('Failed to synchronize locations with database');
      } finally {
        setSyncingLocations(false);
      }
    };
    
    syncLocationsWithDatabase();
  }, []);

  // Fetch fuel cost
  useEffect(() => {
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value')
        .eq('name', 'fuel_cost_per_liter')
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching fuel cost:', error);
        }
        
        const newRecordId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('cost_factors')
          .insert({ 
            id: newRecordId,
            name: 'fuel_cost_per_liter', 
            value: 22, 
            description: 'Cost per liter of fuel in Rand' 
          });
          
        if (insertError) {
          console.error('Error creating fuel cost record:', insertError);
        }
        return;
      }
      
      if (data) {
        setFuelCostPerLiter(data.value);
      }
    };
    
    fetchFuelCost();
  }, []);

  // Update route when start/end locations change
  useEffect(() => {
    if (startLocation) {
      console.log("Start location set:", startLocation);
      setRoute(prev => {
        const existingMiddleLocations = prev.locations.filter(loc => 
          loc.id !== startLocation.id && 
          (endLocation ? loc.id !== endLocation.id : true) &&
          (prev.locations[0] ? loc.id !== prev.locations[0].id : true) && 
          (prev.locations.length > 1 ? loc.id !== prev.locations[prev.locations.length - 1].id : true)
        );
        
        const newLocations = [
          startLocation,
          ...existingMiddleLocations
        ];
        
        if (endLocation) {
          newLocations.push(endLocation);
        }
        
        console.log("Updated route locations:", newLocations);
        
        return {
          ...prev,
          locations: newLocations
        };
      });
    }
  }, [startLocation, endLocation]);
  
  // Update available locations when route changes
  useEffect(() => {
    setRoute(prev => {
      const routeLocationIds = prev.locations.map(loc => loc.id);
      const filteredAvailableLocations = availableLocations.filter(loc => 
        !routeLocationIds.includes(loc.id)
      );
      
      console.log("Filtered available locations:", filteredAvailableLocations.length);
      
      return {
        ...prev,
        availableLocations: filteredAvailableLocations
      };
    });
  }, [availableLocations, route.locations]);

  const handleStartLocationChange = (locationId: string) => {
    console.log("Start location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    if (location) {
      console.log("Found start location:", location);
      setStartLocation(location);
    } else {
      console.error("Could not find location with ID:", locationId);
    }
  };

  const handleEndLocationChange = (locationId: string) => {
    console.log("End location selected:", locationId);
    const location = availableLocations.find(loc => loc.id.toString() === locationId.toString());
    setEndLocation(location || null);
  };

  const addLocationToRoute = (location: LocationType & { cylinders: number }) => {
    console.log("Adding location to route:", location);
    
    const locationWithCylinders = {
      ...location,
      id: location.id.toString(),
      emptyCylinders: location.cylinders,
    };
    
    setRoute(prev => {
      const newLocations = [...prev.locations];
      
      if (endLocation && newLocations.length > 1) {
        newLocations.splice(newLocations.length - 1, 0, locationWithCylinders);
      } else {
        newLocations.push(locationWithCylinders);
      }
      
      console.log("Updated route locations after add:", newLocations);
      
      const newRouteState = {
        ...prev,
        cylinders: prev.cylinders + location.cylinders,
        locations: newLocations
      };
      
      if (newLocations.length > 2) {
        setTimeout(() => handleOptimize(routeOptimizationDefaultParams), 100);
      }
      
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
      
      return {
        ...prev,
        cylinders: prev.cylinders - (removedLocation.emptyCylinders || 0),
        locations: newLocations,
        availableLocations: [...prev.availableLocations, removedLocation]
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
    
    if (params.optimizeForDistance) {
      middleLocations = optimizeLocationOrder(startLoc, middleLocations, endLoc);
    }
    
    const optimizedLocations = [
      startLoc,
      ...middleLocations,
      endLoc
    ];
    
    const metrics = calculateRouteMetrics(optimizedLocations, params);
    
    setRoute(prev => ({
      ...prev,
      locations: optimizedLocations,
      distance: metrics.distance,
      estimatedDuration: metrics.duration,
      fuelConsumption: metrics.fuelConsumption,
      fuelCost: Math.round(metrics.fuelConsumption * fuelCostPerLiter * 100) / 100,
      trafficConditions: metrics.trafficConditions,
      usingRealTimeData: params.useRealTimeData
    }));
    
    toast.success(params.optimizeForDistance ? 
      "Route optimized for shortest distance" : 
      (params.prioritizeFuel ? 
        "Route optimized for best fuel efficiency" : 
        "Route optimized with selected parameters")
    );
  };

  const handleCreateNewRoute = () => {
    setStartLocation(null);
    setEndLocation(null);
    setIsLoadConfirmed(false);
    setRoute({
      distance: 0,
      fuelConsumption: 0,
      fuelCost: 0,
      cylinders: 0,
      locations: [],
      availableLocations: availableLocations,
      trafficConditions: 'moderate',
      estimatedDuration: 75,
      usingRealTimeData: false
    });
    toast.info("New route created");
  };

  const handleFuelCostUpdate = (newCost: number) => {
    setFuelCostPerLiter(newCost);
    
    setRoute(prev => {
      const consumption = prev.fuelConsumption || prev.distance * 0.12;
      return {
        ...prev,
        fuelCost: Math.round(consumption * newCost * 100) / 100
      };
    });
  };

  const handleRouteDataUpdate = (distance: number, duration: number) => {
    setRoute(prev => {
      const consumption = distance * 0.12;
      const cost = consumption * fuelCostPerLiter;
      
      return {
        ...prev,
        distance,
        estimatedDuration: duration,
        fuelConsumption: consumption,
        fuelCost: cost,
      };
    });
  };

  const handleAddNewLocationFromPopover = (locationId: string | number) => {
    console.log("Adding location from popover with ID:", locationId);
    const stringLocationId = String(locationId);
    const location = availableLocations.find(loc => loc.id.toString() === stringLocationId);
    
    if (location) {
      console.log("Found location to add:", location);
      addLocationToRoute({...location, cylinders: location.emptyCylinders || 10});
      toast.success(`Added ${location.name} to route`);
    } else {
      console.error("Could not find location with ID:", locationId);
      toast.error("Could not find the selected location");
    }
  };

  const handleConfirmLoad = async () => {
    if (route.locations.length < 2) {
      toast.error("Route must have at least 2 locations");
      return;
    }
    
    try {
      const locationIds = route.locations.map(loc => loc.id.toString());
      
      const { data: existingLocations, error: locCheckError } = await supabase
        .from('locations')
        .select('id, name')
        .in('id', locationIds);
      
      if (locCheckError) {
        console.error('Error checking locations:', locCheckError);
        toast.error("Failed to verify locations");
        return;
      }
      
      const existingLocationIds = new Set((existingLocations || []).map(loc => loc.id.toString()));
      
      const missingLocations = route.locations.filter(loc => !existingLocationIds.has(loc.id.toString()));
      
      if (missingLocations.length > 0) {
        console.log('Missing locations:', missingLocations);
        
        const locationsToInsert = missingLocations.map(loc => ({
          id: loc.id.toString(),
          name: loc.name,
          address: loc.address || 'Unknown address',
          latitude: loc.lat || 0,
          longitude: loc.long || 0,
          open_time: '08:00',
          close_time: '18:00'
        }));
        
        const { error: insertError } = await supabase
          .from('locations')
          .insert(locationsToInsert);
          
        if (insertError) {
          console.error('Error inserting missing locations:', insertError);
          toast.error("Failed to add missing locations to database");
          return;
        }
        
        toast.success(`Added ${missingLocations.length} missing locations to the database`);
      }
      
      const routeName = `Route ${new Date().toLocaleDateString()}`;
      const routeId = crypto.randomUUID();
      
      const routeData = {
        id: routeId,
        name: routeName,
        date: new Date().toISOString(),
        total_cylinders: route.locations.reduce((sum, loc) => sum + (loc.emptyCylinders || 0), 0),
        total_distance: route.distance || 0,
        total_duration: route.estimatedDuration || 0,
        status: 'scheduled',
        estimated_cost: route.fuelCost
      };
      
      console.log("Saving route data:", routeData);
      
      const { error: routeError } = await supabase
        .from('routes')
        .insert(routeData);
      
      if (routeError) {
        console.error('Error saving route:', routeError);
        toast.error("Failed to confirm load: " + routeError.message);
        return;
      }

      console.log("Route inserted successfully with ID:", routeId);
      
      const deliveries = route.locations.map((location, index) => ({
        id: crypto.randomUUID(),
        route_id: routeId,
        location_id: location.id.toString(),
        cylinders: location.emptyCylinders || 0,
        sequence: index
      }));
      
      console.log("Saving deliveries:", deliveries);
      
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert(deliveries);
      
      if (deliveryError) {
        console.error('Error saving deliveries:', deliveryError);
        toast.error("Failed to save delivery details: " + deliveryError.message);
        
        await supabase
          .from('routes')
          .delete()
          .eq('id', routeId);
          
        return;
      }
      
      setIsLoadConfirmed(true);
      toast.success("Load confirmed successfully", {
        description: `Delivery data for ${new Date().toLocaleDateString()} has been stored.`
      });
    } catch (error: any) {
      console.error("Error confirming load:", error);
      toast.error("An error occurred while confirming the load: " + (error.message || "Unknown error"));
    }
  };

  const handleUpdateLocations = (updatedLocations: LocationType[]) => {
    setAvailableLocations(updatedLocations);
    
    setRoute(prev => {
      const updatedRouteLocations = prev.locations.map(routeLoc => {
        const updatedLoc = updatedLocations.find(loc => loc.id === routeLoc.id);
        if (updatedLoc) {
          return {
            ...routeLoc,
            name: updatedLoc.name,
            address: updatedLoc.address,
            type: updatedLoc.type
          };
        }
        return routeLoc;
      });
      
      return {
        ...prev,
        locations: updatedRouteLocations
      };
    });
  };

  return {
    route,
    availableLocations,
    startLocation, 
    endLocation,
    fuelCostPerLiter,
    isLoadConfirmed,
    isSyncingLocations,
    setStartLocation,
    setEndLocation,
    handleStartLocationChange,
    handleEndLocationChange,
    addLocationToRoute,
    removeLocationFromRoute,
    handleOptimize,
    handleCreateNewRoute,
    handleFuelCostUpdate,
    handleRouteDataUpdate,
    handleAddNewLocationFromPopover,
    handleConfirmLoad,
    handleUpdateLocations,
    setIsLoadConfirmed,
    setAvailableLocations
  };
};

export default useRouteManagement;
