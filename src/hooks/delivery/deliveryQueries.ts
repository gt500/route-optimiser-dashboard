
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

/**
 * Fetches route data for a specific date range with improved error handling and logging
 */
export const fetchRoutesByDateRange = async (startDate: Date, endDate: Date) => {
  // Ensure we're using the full day range for proper filtering
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  console.log('fetchRoutesByDateRange: Fetching routes between:', 
    `${format(start, 'yyyy-MM-dd')} (${start.toISOString()})`, 'and', 
    `${format(end, 'yyyy-MM-dd')} (${end.toISOString()})`);
  
  try {
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .order('date', { ascending: true });
    
    if (routesError) {
      console.error('Error fetching routes:', routesError);
      toast.error('Error fetching route data from the database');
      throw routesError;
    }
    
    console.log('Found routes:', routesData?.length || 0);
    if (routesData && routesData.length > 0) {
      console.log('First route date:', routesData[0].date);
      console.log('Last route date:', routesData[routesData.length - 1].date);
      console.log('Routes data sample:', routesData.slice(0, 1));
    } else {
      console.log('No routes found for date range');
    }
    
    return routesData || [];
  } catch (error) {
    console.error('Unexpected error in fetchRoutesByDateRange:', error);
    throw error;
  }
};

/**
 * Fetches the most recent routes as a fallback with improved error handling
 */
export const fetchRecentRoutes = async (limit = 3) => {
  console.log(`fetchRecentRoutes: Fetching ${limit} most recent routes as fallback`);
  
  try {
    const { data: recentRoutesData, error: recentRoutesError } = await supabase
      .from('routes')
      .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
      .order('date', { ascending: false })
      .limit(limit);
      
    if (recentRoutesError) {
      console.error('Error fetching recent routes:', recentRoutesError);
      toast.error('Error fetching recent route data');
      throw recentRoutesError;
    }
    
    console.log(`Found ${recentRoutesData?.length || 0} recent routes`);
    return recentRoutesData || [];
  } catch (error) {
    console.error('Unexpected error in fetchRecentRoutes:', error);
    throw error;
  }
};

/**
 * Fetches delivery data for the specified route IDs with improved error handling
 */
export const fetchDeliveriesByRouteIds = async (routeIds: string[]) => {
  if (routeIds.length === 0) {
    console.log('fetchDeliveriesByRouteIds: No route IDs provided, returning empty array');
    return [];
  }
  
  console.log(`fetchDeliveriesByRouteIds: Fetching deliveries for ${routeIds.length} routes`);
  
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('id, route_id, location_id, cylinders, sequence')
      .in('route_id', routeIds);
    
    if (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Error fetching delivery data');
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} deliveries`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in fetchDeliveriesByRouteIds:', error);
    throw error;
  }
};

/**
 * Attempts to fetch location data with region and country fields first,
 * falls back to fetching without those fields if they don't exist
 */
export const fetchLocationsByIds = async (locationIds: string[]) => {
  if (locationIds.length === 0) {
    console.log('fetchLocationsByIds: No location IDs provided, returning empty array');
    return { locations: [], includeRegionCountry: false };
  }
  
  console.log(`fetchLocationsByIds: Fetching ${locationIds.length} locations`);
  
  try {
    // Try to fetch with region and country fields
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address, latitude, longitude, region, country')
      .in('id', locationIds);
    
    if (error) {
      // Check if error message indicates missing columns
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('column "region" does not exist')) {
        console.log('Region/country fields not found, falling back to basic location data');
        
        // Fallback to fetch without region and country
        const { data: basicData, error: fallbackError } = await supabase
          .from('locations')
          .select('id, name, address, latitude, longitude')
          .in('id', locationIds);
        
        if (fallbackError) {
          console.error('Error fetching locations without region/country:', fallbackError);
          toast.error('Error fetching location data');
          throw fallbackError;
        }
        
        console.log(`Found ${basicData?.length || 0} locations (without region/country)`);
        return { locations: basicData || [], includeRegionCountry: false };
      } else {
        // If it's some other error, throw it
        console.error('Error fetching locations:', error);
        toast.error('Error fetching location data');
        throw error;
      }
    }
    
    // If we get here, we successfully fetched locations with region and country
    const hasRegionCountry = data && data.length > 0 && 
      (data[0].region !== undefined || data[0].country !== undefined);
    
    console.log(`Found ${data?.length || 0} locations (with region/country: ${hasRegionCountry})`);
    return { locations: data || [], includeRegionCountry: hasRegionCountry };
  } catch (error) {
    console.error('Unexpected error in fetchLocationsByIds:', error);
    throw error;
  }
};
