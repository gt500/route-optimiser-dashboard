
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LocationInfo, LocationType, SupabaseLocation } from '@/types/location';
import { handleSupabaseError, validateInput } from './supabaseUtils';

export const fetchLocationsFromAPI = async (): Promise<LocationInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*');

    if (error) {
      handleSupabaseError(error, 'Failed to fetch locations');
      return [];
    }

    if (data) {
      // Enhanced filtering to remove specific locations completely
      const filteredData = data.filter(item => 
        !item.name?.toLowerCase().includes('shell constantia') &&
        !item.name?.toLowerCase().includes('foodlovers market kzn') &&
        !item.name?.toLowerCase().includes('birkenhead') &&
        !item.name?.toLowerCase().includes('food lovers sunningdale') &&
        !item.name?.toLowerCase().includes('food emporium') &&
        !(item.region === 'KZN' && item.country === 'South Africa')
      );
      
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
    handleSupabaseError(error, 'Error in fetchLocations');
    return [];
  }
};

export const saveLocationToAPI = async (location: LocationType): Promise<boolean> => {
  try {
    // Validate required fields
    const validation = validateInput(location, ['name', 'address', 'lat', 'long', 'type']);
    if (!validation.isValid) {
      toast.error(validation.message || 'Missing required location data');
      return false;
    }
    
    // Validate coordinates
    const latitude = parseFloat(String(location.lat));
    const longitude = parseFloat(String(location.long));
    
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      toast.error('Invalid coordinates provided');
      return false;
    }
    
    const locationData = {
      name: location.name,
      address: location.address,
      latitude: latitude,
      longitude: longitude,
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
        handleSupabaseError(error, 'Error updating location');
        return false;
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
        handleSupabaseError(error, 'Error creating location');
        return false;
      }
      
      console.log('Created new location:', data);
      toast.success(`Location "${location.name}" created`);
      return true;
    }
  } catch (error) {
    handleSupabaseError(error, 'Error saving location');
    return false;
  }
};

export const deleteLocationFromAPI = async (locationId: string): Promise<boolean> => {
  try {
    // Validate the locationId
    if (!locationId || typeof locationId !== 'string' || locationId.trim() === '') {
      toast.error('Invalid location ID');
      return false;
    }
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);
    
    if (error) {
      handleSupabaseError(error, 'Error deleting location');
      return false;
    }
    
    toast.success('Location permanently deleted');
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Error deleting location');
    return false;
  }
};

export const filterLocations = (
  locations: LocationInfo[], 
  searchTerm: string, 
  activeTab: string
): LocationInfo[] => {
  // Validate inputs to prevent filtering issues
  if (!Array.isArray(locations)) {
    console.error('Invalid locations array provided to filterLocations');
    return [];
  }
  
  const term = (searchTerm || '').toLowerCase();
  
  return locations.filter(location => {
    // Skip any malformed location objects
    if (!location || typeof location.name !== 'string' || typeof location.address !== 'string') {
      return false;
    }
    
    const matchesSearch = location.name.toLowerCase().includes(term) ||
                         location.address.toLowerCase().includes(term);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'customers') return matchesSearch && location.type === 'Customer';
    if (activeTab === 'storage') return matchesSearch && location.type === 'Storage';
    return matchesSearch;
  });
};
