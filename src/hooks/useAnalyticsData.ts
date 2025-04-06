
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface AnalyticsData {
  deliveries: number;
  cylinders: number;
  distance: number;
  fuelCost: number;
  routeLength: number;
  monthlyDeliveries: { name: string; value: number }[];
  fuelConsumption: { name: string; value: number }[];
  routeDistribution: { name: string; value: number }[];
  costBreakdown: { name: string; value: number }[];
}

export const useAnalyticsData = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    deliveries: 0,
    cylinders: 0,
    distance: 0,
    fuelCost: 0,
    routeLength: 0,
    monthlyDeliveries: [],
    fuelConsumption: [],
    routeDistribution: [],
    costBreakdown: []
  });
  
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      let startDate, endDate;
      const currentDate = new Date();
      
      // Set start and end dates based on selected time period
      switch(timePeriod) {
        case 'week':
          startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
          endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          break;
        case 'quarter':
          startDate = startOfQuarter(currentDate);
          endDate = endOfQuarter(currentDate);
          break;
        case 'year':
          startDate = startOfYear(currentDate);
          endDate = endOfYear(currentDate);
          break;
      }
      
      console.log(`Fetching analytics data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      
      // Fetch routes for the selected time period
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
        .gte('date', startDate.toISOString())
        .lt('date', addDays(endDate, 1).toISOString())
        .order('date', { ascending: true });
      
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        throw routesError;
      }

      // Fetch deliveries to get location distribution
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, location_id, cylinders, route_id')
        .order('id', { ascending: true });
        
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
        throw deliveriesError;
      }

      // Fetch locations to get area names
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address')
        .order('name', { ascending: true });
        
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }
      
      // Calculate summary data
      const totalDeliveries = routesData?.length || 0;
      const totalCylinders = routesData?.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
      const totalDistance = routesData?.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
      const totalFuelCost = routesData?.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
      const avgRouteLength = totalDistance / (totalDeliveries || 1);
      
      // Create monthly/period breakdown for charts
      const deliveriesByPeriod: Record<string, number> = {};
      const fuelByPeriod: Record<string, number> = {};
      
      // Group routes by month or appropriate period
      routesData?.forEach(route => {
        const routeDate = new Date(route.date);
        const periodKey = format(routeDate, timePeriod === 'year' ? 'MMM' : 'MMM d');
        
        deliveriesByPeriod[periodKey] = (deliveriesByPeriod[periodKey] || 0) + 1;
        fuelByPeriod[periodKey] = (fuelByPeriod[periodKey] || 0) + (route.estimated_cost || 0);
      });
      
      // Create location distribution data
      const deliveriesByLocation: Record<string, number> = {};
      
      deliveriesData?.forEach(delivery => {
        const location = locationsData?.find(loc => loc.id === delivery.location_id);
        if (location) {
          const locationName = location.name;
          deliveriesByLocation[locationName] = (deliveriesByLocation[locationName] || 0) + (delivery.cylinders || 0);
        }
      });
      
      // Format data for charts
      const monthlyDeliveriesData = Object.entries(deliveriesByPeriod).map(([name, value]) => ({ name, value }));
      const fuelConsumptionData = Object.entries(fuelByPeriod).map(([name, value]) => ({ name, value }));
      const routeDistributionData = Object.entries(deliveriesByLocation)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 locations
      
      // Cost breakdown (approximation based on fuel cost)
      const costBreakdownData = [
        { name: 'Fuel', value: 45 },
        { name: 'Maintenance', value: 20 },
        { name: 'Labor', value: 25 },
        { name: 'Other', value: 10 }
      ];
      
      setAnalyticsData({
        deliveries: totalDeliveries,
        cylinders: totalCylinders,
        distance: totalDistance,
        fuelCost: totalFuelCost,
        routeLength: avgRouteLength,
        monthlyDeliveries: monthlyDeliveriesData,
        fuelConsumption: fuelConsumptionData,
        routeDistribution: routeDistributionData,
        costBreakdown: costBreakdownData
      });
      
      console.log('Analytics data loaded:', {
        deliveries: totalDeliveries,
        cylinders: totalCylinders,
        distance: totalDistance,
        fuelCost: totalFuelCost
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on initial load and when time period changes
  useEffect(() => {
    fetchData();
  }, [timePeriod]);
  
  return {
    analyticsData,
    timePeriod,
    setTimePeriod,
    isLoading,
    fetchData
  };
};
