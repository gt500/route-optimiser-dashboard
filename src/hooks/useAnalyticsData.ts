
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface AnalyticsData {
  deliveries: number;
  deliveriesChange: number;
  cylinders: number;
  cylindersChange: number;
  distance: number;
  fuelCost: number;
  fuelCostChange: number;
  routeLength: number;
  routeLengthChange: number;
  monthlyDeliveries: { name: string; value: number }[];
  fuelConsumption: { name: string; value: number }[];
  routeDistribution: { name: string; value: number }[];
  costBreakdown: { name: string; value: number }[];
  // Add the missing properties
  optimizationData?: { name: string; value: number }[];
  loadDistribution?: { name: string; value: number }[];
  optimizationPercentage?: number;
}

export const useAnalyticsData = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    deliveries: 0,
    deliveriesChange: 0,
    cylinders: 0,
    cylindersChange: 0,
    distance: 0,
    fuelCost: 0,
    fuelCostChange: 0,
    routeLength: 0,
    routeLengthChange: 0,
    monthlyDeliveries: [],
    fuelConsumption: [],
    routeDistribution: [],
    costBreakdown: []
  });
  
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      let startDate, endDate, previousStartDate, previousEndDate;
      const currentDate = new Date();
      
      // Set start and end dates based on selected time period
      switch(timePeriod) {
        case 'week':
          startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
          endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
          previousStartDate = addDays(startDate, -7);
          previousEndDate = addDays(endDate, -7);
          break;
        case 'month':
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          previousStartDate = startOfMonth(addDays(startDate, -31));
          previousEndDate = endOfMonth(addDays(startDate, -1));
          break;
        case 'quarter':
          startDate = startOfQuarter(currentDate);
          endDate = endOfQuarter(currentDate);
          previousStartDate = startOfQuarter(addDays(startDate, -92));
          previousEndDate = endOfQuarter(addDays(startDate, -1));
          break;
        case 'year':
          startDate = startOfYear(currentDate);
          endDate = endOfYear(currentDate);
          previousStartDate = startOfYear(addDays(startDate, -366));
          previousEndDate = endOfYear(addDays(startDate, -1));
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

      // Fetch previous period data for comparison
      const { data: prevRoutesData, error: prevRoutesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
        .gte('date', previousStartDate.toISOString())
        .lt('date', addDays(previousEndDate, 1).toISOString());
        
      if (prevRoutesError) {
        console.error('Error fetching previous period routes:', prevRoutesError);
        // Continue anyway, we'll just have missing change metrics
      }

      // Fetch deliveries to get location distribution
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, location_id, cylinders, route_id');
        
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
        throw deliveriesError;
      }

      // Fetch locations to get area names
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address');
        
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
      
      // Calculate previous period metrics
      const prevTotalDeliveries = prevRoutesData?.length || 0;
      const prevTotalCylinders = prevRoutesData?.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
      const prevTotalDistance = prevRoutesData?.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
      const prevTotalFuelCost = prevRoutesData?.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
      const prevAvgRouteLength = prevTotalDistance / (prevTotalDeliveries || 1);
      
      // Calculate percentage changes
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      
      const deliveriesChange = calculatePercentChange(totalDeliveries, prevTotalDeliveries);
      const cylindersChange = calculatePercentChange(totalCylinders, prevTotalCylinders);
      const fuelCostChange = calculatePercentChange(totalFuelCost, prevTotalFuelCost);
      const routeLengthChange = calculatePercentChange(avgRouteLength, prevAvgRouteLength);
      
      // Create period breakdown for charts based on selected time period
      const deliveriesByPeriod: Record<string, number> = {};
      const fuelByPeriod: Record<string, number> = {};
      
      // Format the date key based on the selected time period
      routesData?.forEach(route => {
        if (!route.date) return;
        
        const routeDate = new Date(route.date);
        let periodKey;
        
        switch(timePeriod) {
          case 'week':
            periodKey = format(routeDate, 'E'); // Mon, Tue, etc.
            break;
          case 'month':
            periodKey = format(routeDate, 'd MMM'); // 1 Jan, 2 Jan, etc.
            break;
          case 'quarter':
            periodKey = format(routeDate, 'MMM'); // Jan, Feb, etc.
            break;
          case 'year':
            periodKey = format(routeDate, 'MMM'); // Jan, Feb, etc.
            break;
          default:
            periodKey = format(routeDate, 'MMM d');
        }
        
        deliveriesByPeriod[periodKey] = (deliveriesByPeriod[periodKey] || 0) + 1;
        fuelByPeriod[periodKey] = (fuelByPeriod[periodKey] || 0) + (route.estimated_cost || 0);
      });
      
      // Filter deliveries for routes within the selected time period
      const periodRouteIds = routesData?.map(route => route.id) || [];
      const periodDeliveries = deliveriesData?.filter(delivery => 
        periodRouteIds.includes(delivery.route_id || '')
      ) || [];
      
      // Create location distribution data
      const deliveriesByLocation: Record<string, number> = {};
      
      periodDeliveries.forEach(delivery => {
        if (!delivery.location_id) return;
        
        const location = locationsData?.find(loc => loc.id === delivery.location_id);
        if (location) {
          const locationName = location.name;
          deliveriesByLocation[locationName] = (deliveriesByLocation[locationName] || 0) + (delivery.cylinders || 0);
        }
      });
      
      // Format data for charts
      // Ensure data is sorted by period sequence (days of week, days of month, etc.)
      const sortedDeliveriesByPeriod = Object.entries(deliveriesByPeriod);
      const sortedFuelByPeriod = Object.entries(fuelByPeriod);
      
      // For week view, sort by day of week
      if (timePeriod === 'week') {
        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        sortedDeliveriesByPeriod.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));
        sortedFuelByPeriod.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));
      }
      
      const monthlyDeliveriesData = sortedDeliveriesByPeriod.map(([name, value]) => ({ name, value }));
      const fuelConsumptionData = sortedFuelByPeriod.map(([name, value]) => ({ name, value }));
      
      // Sort location distribution by cylinder count (descending) and take top 5
      const routeDistributionData = Object.entries(deliveriesByLocation)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      // Calculate real cost breakdown based on actual data
      // For this example, we'll estimate the breakdown based on the total fuel cost
      const totalCost = totalFuelCost;
      const fuelPercentage = 45; // 45% of total cost
      const maintenancePercentage = 20; // 20% of total cost
      const laborPercentage = 25; // 25% of total cost
      const otherPercentage = 10; // 10% of total cost
      
      const costBreakdownData = [
        { name: 'Fuel', value: Math.round((fuelPercentage / 100) * totalCost) },
        { name: 'Maintenance', value: Math.round((maintenancePercentage / 100) * totalCost) },
        { name: 'Labor', value: Math.round((laborPercentage / 100) * totalCost) },
        { name: 'Other', value: Math.round((otherPercentage / 100) * totalCost) }
      ];
      
      setAnalyticsData({
        deliveries: totalDeliveries,
        deliveriesChange: Math.round(deliveriesChange),
        cylinders: totalCylinders,
        cylindersChange: Math.round(cylindersChange),
        distance: totalDistance,
        fuelCost: totalFuelCost,
        fuelCostChange: Math.round(fuelCostChange),
        routeLength: avgRouteLength,
        routeLengthChange: Math.round(routeLengthChange),
        monthlyDeliveries: monthlyDeliveriesData,
        fuelConsumption: fuelConsumptionData,
        routeDistribution: routeDistributionData,
        costBreakdown: costBreakdownData
      });
      
      console.log('Analytics data loaded:', {
        deliveries: totalDeliveries,
        deliveriesChange,
        cylinders: totalCylinders,
        cylindersChange,
        distance: totalDistance,
        fuelCost: totalFuelCost,
        fuelCostChange,
        routeLength: avgRouteLength,
        routeLengthChange,
        monthlyDeliveries: monthlyDeliveriesData,
        routeDistribution: routeDistributionData
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
