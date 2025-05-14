
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, isValid } from 'date-fns';
import { toast } from 'sonner';
import { handleSupabaseError } from '@/utils/supabaseUtils';

/**
 * Validates date inputs to prevent SQL injection via date parameters
 */
const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  if (!isValid(startDate) || !isValid(endDate)) {
    console.error('Invalid date objects provided to fetchRoutesByDateRange');
    return false;
  }
  
  if (endDate < startDate) {
    console.error('End date cannot be before start date');
    return false;
  }
  
  return true;
};

/**
 * Fetches route data for a specific date range with improved error handling and logging
 */
export const fetchRoutesByDateRange = async (startDate: Date, endDate: Date) => {
  // Validate date range
  if (!validateDateRange(startDate, endDate)) {
    toast.error('Invalid date range for fetching routes');
    return [];
  }
  
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
      handleSupabaseError(routesError, 'Error fetching routes');
      return [];
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
    handleSupabaseError(error, 'Unexpected error in fetchRoutesByDateRange');
    return [];
  }
};

/**
 * Fetches the most recent routes as a fallback with improved error handling
 */
export const fetchRecentRoutes = async (limit = 3) => {
  // Validate input
  const safeLimit = Math.min(Math.max(1, Number(limit) || 3), 10); // Between 1-10
  
  console.log(`fetchRecentRoutes: Fetching ${safeLimit} most recent routes as fallback`);
  
  try {
    const { data: recentRoutesData, error: recentRoutesError } = await supabase
      .from('routes')
      .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
      .order('date', { ascending: false })
      .limit(safeLimit);
      
    if (recentRoutesError) {
      handleSupabaseError(recentRoutesError, 'Error fetching recent routes');
      return [];
    }
    
    console.log(`Found ${recentRoutesData?.length || 0} recent routes`);
    return recentRoutesData || [];
  } catch (error) {
    handleSupabaseError(error, 'Unexpected error in fetchRecentRoutes');
    return [];
  }
};

/**
 * Fetches delivery data for the specified route IDs with improved error handling
 */
export const fetchDeliveriesByRouteIds = async (routeIds: string[]) => {
  // Validate input
  if (!Array.isArray(routeIds) || routeIds.length === 0) {
    console.log('fetchDeliveriesByRouteIds: No route IDs provided, returning empty array');
    return [];
  }
  
  // Validate each route ID to prevent injection
  const validRouteIds = routeIds.filter(id => typeof id === 'string' && id.trim() !== '');
  
  if (validRouteIds.length === 0) {
    console.log('fetchDeliveriesByRouteIds: No valid route IDs provided, returning empty array');
    return [];
  }
  
  console.log(`fetchDeliveriesByRouteIds: Fetching deliveries for ${validRouteIds.length} routes`);
  
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('id, route_id, location_id, cylinders, sequence')
      .in('route_id', validRouteIds);
    
    if (error) {
      handleSupabaseError(error, 'Error fetching deliveries');
      return [];
    }
    
    console.log(`Found ${data?.length || 0} deliveries`);
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'Unexpected error in fetchDeliveriesByRouteIds');
    return [];
  }
};

/**
 * Fetches location data including the newly added region and country fields
 */
export const fetchLocationsByIds = async (locationIds: string[]) => {
  // Validate input
  if (!Array.isArray(locationIds) || locationIds.length === 0) {
    console.log('fetchLocationsByIds: No location IDs provided, returning empty array');
    return { locations: [], includeRegionCountry: false };
  }
  
  // Validate each location ID to prevent injection
  const validLocationIds = locationIds.filter(id => typeof id === 'string' && id.trim() !== '');
  
  if (validLocationIds.length === 0) {
    console.log('fetchLocationsByIds: No valid location IDs provided, returning empty array');
    return { locations: [], includeRegionCountry: false };
  }
  
  console.log(`fetchLocationsByIds: Fetching ${validLocationIds.length} locations`);
  
  try {
    // Now we can directly fetch with region and country fields without worrying about errors
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address, latitude, longitude, region, country')
      .in('id', validLocationIds);
    
    if (error) {
      handleSupabaseError(error, 'Error fetching locations');
      return { locations: [], includeRegionCountry: false };
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
    handleSupabaseError(error, 'Unexpected error in fetchLocationsByIds');
    return { locations: [], includeRegionCountry: false };
  }
};
