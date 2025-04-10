
import { useState, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLocationSync = (initialLocations: LocationType[] = []) => {
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>(initialLocations);
  const [isSyncingLocations, setSyncingLocations] = useState(true);

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

  return {
    availableLocations,
    setAvailableLocations,
    isSyncingLocations
  };
};
