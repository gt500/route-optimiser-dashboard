
import { addDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all necessary data for analytics from Supabase
 */
export async function fetchAnalyticsData(
  startDate: Date,
  endDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
) {
  console.log(`Detailed fetch ranges: 
    Current: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}
    Previous: ${format(previousStartDate, 'yyyy-MM-dd')} to ${format(previousEndDate, 'yyyy-MM-dd')}`
  );

  // Batch requests to improve performance
  const [routesResponse, prevRoutesResponse, deliveriesResponse, locationsResponse] = await Promise.all([
    supabase
      .from('routes')
      .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
      .gte('date', startDate.toISOString())
      .lt('date', addDays(endDate, 1).toISOString())
      .order('date', { ascending: true }),
    
    supabase
      .from('routes')
      .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
      .gte('date', previousStartDate.toISOString())
      .lt('date', addDays(previousEndDate, 1).toISOString()),
    
    supabase
      .from('deliveries')
      .select('id, location_id, cylinders, route_id'),
    
    supabase
      .from('locations')
      .select('id, name, address')
  ]);

  // Handle errors
  if (routesResponse.error) throw routesResponse.error;
  if (deliveriesResponse.error) throw deliveriesResponse.error;
  if (locationsResponse.error) throw locationsResponse.error;

  // Get the data or empty arrays
  const routesData = routesResponse.data || [];
  const prevRoutesData = prevRoutesResponse.data || [];
  const deliveriesData = deliveriesResponse.data || [];
  const locationsData = locationsResponse.data || [];

  return {
    routesData,
    prevRoutesData,
    deliveriesData,
    locationsData
  };
}
