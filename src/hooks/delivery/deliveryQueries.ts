
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
 * Fetches location data including the newly added region and country fields
 */
export const fetchLocationsByIds = async (locationIds: string[]) => {
  if (locationIds.length === 0) {
    console.log('fetchLocationsByIds: No location IDs provided, returning empty array');
    return { locations: [], includeRegionCountry: false };
  }
  
  console.log(`fetchLocationsByIds: Fetching ${locationIds.length} locations`);
  
  try {
    // Now we can directly fetch with region and country fields without worrying about errors
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address, latitude, longitude, region, country')
      .in('id', locationIds);
    
    if (error) {
      console.error('Error fetching locations:', error);
      toast.error('Error fetching location data');
      throw error;
    }
    
    // Check if any of the locations have region or country data
    const hasRegionCountryData = data && data.length > 0 && 
      data.some(location => location.region || location.country);
    
    console.log(`Found ${data?.length || 0} locations (with region/country data: ${hasRegionCountryData})`);
    return { 
      locations: data || [], 
      includeRegionCountry: hasRegionCountryData 
    };
  } catch (error) {
    console.error('Unexpected error in fetchLocationsByIds:', error);
    throw error;
  }
};
