
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LocationInfo, LocationType, SupabaseLocation } from '@/types/location';

export const fetchLocationsFromAPI = async (): Promise<LocationInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*');

    if (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
      return [];
    }

    if (data) {
      // Ensure Food Lovers Sunningdale is completely excluded from the data
      const filteredData = data.filter(item => 
        !item.name?.toLowerCase().includes('food lovers sunningdale'));
      
      const mappedLocations = filteredData.map(item => {
        let locationType = item.type || 'Customer';
        
        if (!item.type) {
          if (item.name?.toLowerCase().includes('epping') && item.name?.toLowerCase().includes('depot')) {
            locationType = 'Storage';
          } else if (item.name?.toLowerCase().includes('depot') || item.name?.toLowerCase().includes('storage')) {
            locationType = 'Storage';
          }
        }
        
        return {
          id: item.id,
          name: item.name,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          type: locationType,
          fullCylinders: locationType === 'Storage' ? 75 : 0,
          emptyCylinders: locationType === 'Customer' ? 15 : 0,
          open_time: item.open_time || '08:00',
          close_time: item.close_time || '17:00',
          region: item.region || '',
          country: item.country || ''
        };
      });
      
      return mappedLocations;
    }
    return [];
  } catch (error) {
    console.error('Error in fetchLocations:', error);
    toast.error('Failed to fetch locations');
    return [];
  }
};

export const saveLocationToAPI = async (location: LocationType): Promise<boolean> => {
  try {
    const locationData = {
      name: location.name,
      address: location.address,
      latitude: location.lat,
      longitude: location.long,
      type: location.type,
      open_time: location.open_time || '08:00',
      close_time: location.close_time || '17:00',
      region: location.region || null,
      country: location.country || null
    };
    
    console.log('Location data to save:', locationData);
    
    if (location.id) {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', location.id)
        .select();
      
      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }
      
      console.log('Updated location:', data);
      toast.success(`Location "${location.name}" updated`);
      return true;
    } else {
      const newLocationId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('locations')
        .insert({
          ...locationData,
          id: newLocationId
        })
        .select();
      
      if (error) {
        console.error('Error creating location:', error);
        throw error;
      }
      
      console.log('Created new location:', data);
      toast.success(`Location "${location.name}" created`);
      return true;
    }
  } catch (error) {
    console.error('Error saving location:', error);
    toast.error('Failed to save location');
    return false;
  }
};

export const deleteLocationFromAPI = async (locationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);
    
    if (error) throw error;
    
    toast.success('Location permanently deleted');
    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    toast.error('Failed to delete location');
    return false;
  }
};

export const filterLocations = (
  locations: LocationInfo[], 
  searchTerm: string, 
  activeTab: string
): LocationInfo[] => {
  return locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'customers') return matchesSearch && location.type === 'Customer';
    if (activeTab === 'storage') return matchesSearch && location.type === 'Storage';
    return matchesSearch;
  });
};
