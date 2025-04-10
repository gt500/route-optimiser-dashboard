
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

/**
 * Fetches route data for a specific date range
 */
export const fetchRoutesByDateRange = async (startDate: Date, endDate: Date) => {
  console.log('Fetching routes between:', startDate.toISOString(), 'and', endDate.toISOString());
  
  const { data: routesData, error: routesError } = await supabase
    .from('routes')
    .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('created_at', { ascending: false });
  
  if (routesError) {
    console.error('Error fetching routes:', routesError);
    throw routesError;
  }
  
  return routesData || [];
};

/**
 * Fetches the most recent routes as a fallback
 */
export const fetchRecentRoutes = async (limit = 3) => {
  const { data: recentRoutesData, error: recentRoutesError } = await supabase
    .from('routes')
    .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
    .order('date', { ascending: false })
    .limit(limit);
    
  if (recentRoutesError) {
    console.error('Error fetching recent routes:', recentRoutesError);
    throw recentRoutesError;
  }
  
  return recentRoutesData || [];
};

/**
 * Fetches delivery data for the specified route IDs
 */
export const fetchDeliveriesByRouteIds = async (routeIds: string[]) => {
  if (routeIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('deliveries')
    .select('id, route_id, location_id, cylinders, sequence')
    .in('route_id', routeIds);
  
  if (error) {
    console.error('Error fetching deliveries:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Attempts to fetch location data with region and country fields first,
 * falls back to fetching without those fields if they don't exist
 */
export const fetchLocationsByIds = async (locationIds: string[]) => {
  if (locationIds.length === 0) return { locations: [], includeRegionCountry: false };
  
  try {
    // Try to fetch with region and country fields
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address, latitude, longitude, region, country')
      .in('id', locationIds);
    
    if (error) {
      throw error;
    }
    
    return { locations: data || [], includeRegionCountry: true };
  } catch (error) {
    console.error('Failed to fetch with region/country, trying without:', error);
    
    // Fallback to fetch without region and country
    const { data, error: fallbackError } = await supabase
      .from('locations')
      .select('id, name, address, latitude, longitude')
      .in('id', locationIds);
    
    if (fallbackError) {
      console.error('Error fetching locations without region/country:', fallbackError);
      throw fallbackError;
    }
    
    return { locations: data || [], includeRegionCountry: false };
  }
};
