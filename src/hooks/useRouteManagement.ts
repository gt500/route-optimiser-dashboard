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

export interface VehicleConfigProps {
  baseConsumption: number; // L/100km
  fuelPrice: number; // R per liter
  maintenanceCostPerKm: number; // R per km
}

export const defaultVehicleConfig: VehicleConfigProps = {
  baseConsumption: 12,
  fuelPrice: 21.95,
  maintenanceCostPerKm: 0.50
};

export const MAX_CYLINDERS = 80;
export const CYLINDER_WEIGHT_KG = 22;

export const useRouteManagement = (initialLocations: LocationType[] = []) => {
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>(initialLocations);
  const [startLocation, setStartLocation] = useState<LocationType | null>(null);
  const [endLocation, setEndLocation] = useState<LocationType | null>(null);
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfigProps>(defaultVehicleConfig);
  const [isLoadConfirmed, setIsLoadConfirmed] = useState(false);
  const [isSyncingLocations, setSyncingLocations] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  
  const [route, setRoute] = useState({
    distance: 0,
    fuelConsumption: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    totalCost: 0,
    cylinders: 0,
    locations: [] as LocationType[],
    availableLocations: [] as LocationType[],
    trafficConditions: 'moderate' as 'light' | 'moderate' | 'heavy',
    estimatedDuration: 0,
    usingRealTimeData: false
  });

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

  useEffect(() => {
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value, id')
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
            value: 21.95, 
            description: 'Cost per liter of fuel in Rand' 
          });
          
        if (insertError) {
          console.error('Error creating fuel cost record:', insertError);
        }
        return;
      }
      
      if (data) {
        setVehicleConfig(prev => ({
          ...prev,
          fuelPrice: data.value
        }));
      }
    };

    const fetchVehicleConfig = async () => {
      try {
        const { data: consumptionData } = await supabase
          .from('cost_factors')
          .select('value, id')
          .eq('name', 'base_fuel_consumption')
          .single();

        const { data: maintenanceData } = await supabase
          .from('cost_factors')
          .select('value, id')
          .eq('name', 'maintenance_cost_per_km')
          .single();

        setVehicleConfig(prev => ({
          ...prev,
          baseConsumption: consumptionData?.value ?? prev.baseConsumption,
          maintenanceCostPerKm: maintenanceData?.value ?? prev.maintenanceCostPerKm
        }));
      } catch (err) {
        console.error("Error fetching vehicle config:", err);
      }
    };
    
    fetchFuelCost();
    fetchVehicleConfig();
  }, []);

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

  const updateVehicleConfig = (config: Partial<VehicleConfigProps>) => {
    setVehicleConfig(prev => {
      const updatedConfig = { ...prev, ...config };
      updateVehicleConfigInDatabase(updatedConfig);
      
      if (route.locations.length > 1 && config.fuelPrice !== undefined) {
        updateRouteCosts(route.distance, config.fuelPrice);
      }
      
      return updatedConfig;
    });
  };

  const updateVehicleConfigInDatabase = async (config: VehicleConfigProps) => {
    try {
      const { data: existingRecords, error: fetchError } = await supabase
        .from('cost_factors')
        .select('id, name')
        .in('name', ['fuel_cost_per_liter', 'base_fuel_consumption', 'maintenance_cost_per_km']);
      
      if (fetchError) {
        console.error('Error fetching cost factors:', fetchError);
        return;
      }
      
      const recordMap = new Map();
      existingRecords?.forEach(record => {
        recordMap.set(record.name, record.id);
      });
      
      const fuelCostId = recordMap.get('fuel_cost_per_liter') || crypto.randomUUID();
      const { error: fuelError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: fuelCostId,
          name: 'fuel_cost_per_liter', 
          value: config.fuelPrice, 
          description: 'Cost per liter of fuel in Rand' 
        });
        
      if (fuelError) console.error('Error updating fuel cost:', fuelError);
      
      const consumptionId = recordMap.get('base_fuel_consumption') || crypto.randomUUID();
      const { error: consumptionError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: consumptionId,
          name: 'base_fuel_consumption', 
          value: config.baseConsumption, 
          description: 'Base fuel consumption in L/100km' 
        });
        
      if (consumptionError) console.error('Error updating fuel consumption:', consumptionError);
      
      const maintenanceId = recordMap.get('maintenance_cost_per_km') || crypto.randomUUID();
      const { error: maintenanceError } = await supabase
        .from('cost_factors')
        .upsert({ 
          id: maintenanceId,
          name: 'maintenance_cost_per_km', 
          value: config.maintenanceCostPerKm, 
          description: 'Vehicle maintenance cost per kilometer' 
        });
        
      if (maintenanceError) console.error('Error updating maintenance cost:', maintenanceError);
      
    } catch (error) {
      console.error('Error updating vehicle configuration:', error);
    }
  };

  const updateRouteCosts = (distance: number, fuelPrice?: number) => {
    const priceToUse = fuelPrice !== undefined ? fuelPrice : vehicleConfig.fuelPrice;
    const fuelConsumption = (distance * vehicleConfig.baseConsumption) / 100;
    const fuelCost = fuelConsumption * priceToUse;
    const maintenanceCost = distance * vehicleConfig.maintenanceCostPerKm;
    const totalCost = fuelCost + maintenanceCost;
    
    console.log(`Updating route costs with: distance=${distance}, fuelPrice=${priceToUse}, consumption=${fuelConsumption}, cost=${fuelCost}`);
    
    setRoute(prev => ({
      ...prev,
      fuelConsumption,
      fuelCost,
      maintenanceCost,
      totalCost
    }));
  };

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
    
    const metrics = calculateRouteMetrics(optimizedLocations, params, vehicleConfig.fuelPrice);
    
    setRoute(prev => ({
      ...prev,
      locations: optimizedLocations,
      distance: metrics.distance,
      estimatedDuration: metrics.duration,
      fuelConsumption: metrics.fuelConsumption,
      fuelCost: metrics.fuelCost,
      trafficConditions: metrics.trafficConditions,
      usingRealTimeData: params.useRealTimeData
    }));
    
    toast.success(params.prioritizeFuel ? 
      "Route optimized for best fuel efficiency" : 
      (params.optimizeForDistance ? 
        "Route optimized for shortest distance" : 
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
      maintenanceCost: 0,
      totalCost: 0,
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
    console.log("Fuel cost updated to:", newCost);
    
    updateVehicleConfig({ fuelPrice: newCost });
    
    if (route.locations.length > 1) {
      updateRouteCosts(route.distance, newCost);
    }
    
    toast.success(`Fuel cost updated to R${newCost.toFixed(2)}/L`);
  };

  const handleRouteDataUpdate = (distance: number, duration: number) => {
    setRoute(prev => {
      const consumption = distance * 0.12;
      const cost = consumption * vehicleConfig.fuelPrice;
      
      console.log(`Route data updated: distance=${distance}, duration=${duration}, consumption=${consumption}, fuelPrice=${vehicleConfig.fuelPrice}, cost=${cost}`);
      
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
    
    if (route.cylinders > MAX_CYLINDERS) {
      toast.error(`Weight limit exceeded! Maximum capacity is ${MAX_CYLINDERS} cylinders (${MAX_CYLINDERS * CYLINDER_WEIGHT_KG}kg).`);
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
        estimated_cost: route.fuelCost,
        vehicle_id: selectedVehicle && selectedVehicle !== 'none' ? selectedVehicle : null
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
      
      if (selectedVehicle && selectedVehicle !== 'none') {
        console.log(`Vehicle ${selectedVehicle} status would be updated to On Route with load ${route.cylinders}`);
      }
      
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

  const updateVehicleStatus = (vehicle: any, status: string, load: number) => {
    console.log(`Updating ${vehicle.id} status to ${status} with load ${load}`);
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
    route,
    availableLocations,
    startLocation, 
    endLocation,
    vehicleConfig,
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
    handleReplaceLocation,
    setIsLoadConfirmed,
    setAvailableLocations,
    updateVehicleConfig,
    selectedVehicle,
    setSelectedVehicle
  };
};

export default useRouteManagement;
