
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RouteState, MAX_CYLINDERS } from './types';
import { LocationType } from '@/types/location';
import { toast } from 'sonner';

export const useSaveRoute = (
  route: RouteState,
  setIsLoadConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  selectedVehicle: string | null
) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmLoad = async () => {
    if (route.locations.length < 2) {
      toast.error("Route must have at least 2 locations");
      return;
    }
    
    if (route.cylinders > MAX_CYLINDERS) {
      toast.error(`Weight limit exceeded! Maximum capacity is ${MAX_CYLINDERS} cylinders (${MAX_CYLINDERS * 22}kg).`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const locationIds = route.locations.map(loc => loc.id.toString());
      
      const { data: existingLocations, error: locCheckError } = await supabase
        .from('locations')
        .select('id, name')
        .in('id', locationIds);
      
      if (locCheckError) {
        console.error('Error checking locations:', locCheckError);
        toast.error("Failed to verify locations");
        setIsSaving(false);
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
          close_time: '18:00',
          region: loc.region || route.region || '',
          country: loc.country || route.country || ''
        }));
        
        const { error: insertError } = await supabase
          .from('locations')
          .insert(locationsToInsert);
          
        if (insertError) {
          console.error('Error inserting missing locations:', insertError);
          toast.error("Failed to add missing locations to database");
          setIsSaving(false);
          return;
        }
        
        toast.success(`Added ${missingLocations.length} missing locations to the database`);
      }
      
      const routeName = `Route ${new Date().toLocaleDateString()}`;
      const routeId = crypto.randomUUID();
      
      // Check if the routes table has region and country columns before including them
      const { data: routeColumns, error: columnsError } = await supabase
        .from('routes')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.error('Error checking routes table structure:', columnsError);
      }
      
      // Create base route data without region/country
      const routeData: any = {
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
      
      // Only add region/country if they exist in the database schema
      const routeColumnNames = routeColumns && routeColumns.length > 0 
        ? Object.keys(routeColumns[0])
        : [];
        
      if (routeColumnNames.includes('region') && route.region) {
        routeData.region = route.region;
      }
      
      if (routeColumnNames.includes('country') && route.country) {
        routeData.country = route.country;
      }
      
      console.log("Saving route data:", routeData);
      
      const { error: routeError } = await supabase
        .from('routes')
        .insert(routeData);
      
      if (routeError) {
        console.error('Error saving route:', routeError);
        toast.error("Failed to confirm load: " + routeError.message);
        setIsSaving(false);
        return;
      }

      console.log("Route inserted successfully with ID:", routeId);
      
      if (selectedVehicle && selectedVehicle !== 'none') {
        console.log(`Vehicle ${selectedVehicle} status would be updated to On Route with load ${route.cylinders}`);
      }
      
      // Check if the deliveries table has region and country columns
      const { data: deliveryColumns, error: deliveryColumnsError } = await supabase
        .from('deliveries')
        .select('*')
        .limit(1);
        
      if (deliveryColumnsError) {
        console.error('Error checking deliveries table structure:', deliveryColumnsError);
      }
      
      const deliveryColumnNames = deliveryColumns && deliveryColumns.length > 0 
        ? Object.keys(deliveryColumns[0])
        : [];
      
      const deliveries = route.locations.map((location, index) => {
        const delivery: any = {
          id: crypto.randomUUID(),
          route_id: routeId,
          location_id: location.id.toString(),
          cylinders: location.emptyCylinders || 0,
          sequence: index
        };
        
        // Only add region/country if they exist in the database schema
        if (deliveryColumnNames.includes('region')) {
          delivery.region = location.region || route.region || '';
        }
        
        if (deliveryColumnNames.includes('country')) {
          delivery.country = location.country || route.country || '';
        }
        
        return delivery;
      });
      
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
         
        setIsSaving(false); 
        return;
      }
      
      setIsLoadConfirmed(true);
      toast.success("Load confirmed successfully", {
        description: `Delivery data for ${new Date().toLocaleDateString()} has been stored.`
      });
    } catch (error: any) {
      console.error("Error confirming load:", error);
      toast.error("An error occurred while confirming the load: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleConfirmLoad,
    isSaving
  };
};
