
import { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { TimePeriod, AnalyticsData } from './analyticsTypes';
import { getPeriodDates, calculatePercentChange } from './analyticsDateUtils';
import { formatPeriodKey, sortByPeriod } from './analyticsChartUtils';

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

  // Use useCallback to prevent unnecessary function recreation
  const fetchData = useCallback(async () => {
    // Track if component is still mounted
    let isMounted = true;
    setIsLoading(true);

    try {
      const { startDate, endDate, previousStartDate, previousEndDate } = getPeriodDates(timePeriod);
      console.log(`Fetching analytics data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

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

      // Check if the component is still mounted before updating state
      if (!isMounted) return;

      const routesData = routesResponse.data || [];
      const prevRoutesData = prevRoutesResponse.data || [];
      const deliveriesData = deliveriesResponse.data || [];
      const locationsData = locationsResponse.data || [];

      if (routesResponse.error) throw routesResponse.error;
      if (deliveriesResponse.error) throw deliveriesResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      // Use a more efficient calculation approach
      const calculateMetrics = () => {
        // Summary metrics
        const totalDeliveries = routesData.length || 0;
        const totalCylinders = routesData.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
        const totalDistance = routesData.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
        const totalFuelCost = routesData.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
        const avgRouteLength = totalDeliveries ? totalDistance / totalDeliveries : 0;

        // Previous metrics for comparison
        const prevTotalDeliveries = prevRoutesData.length || 0;
        const prevTotalCylinders = prevRoutesData.reduce((sum, route) => sum + (route.total_cylinders || 0), 0) || 0;
        const prevTotalDistance = prevRoutesData.reduce((sum, route) => sum + (route.total_distance || 0), 0) || 0;
        const prevTotalFuelCost = prevRoutesData.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) || 0;
        const prevAvgRouteLength = prevTotalDeliveries ? prevTotalDistance / prevTotalDeliveries : 0;

        // Calculate percent changes
        const deliveriesChange = calculatePercentChange(totalDeliveries, prevTotalDeliveries);
        const cylindersChange = calculatePercentChange(totalCylinders, prevTotalCylinders);
        const fuelCostChange = calculatePercentChange(totalFuelCost, prevTotalFuelCost);
        const routeLengthChange = calculatePercentChange(avgRouteLength, prevAvgRouteLength);

        // Process period data for charts
        const deliveriesByPeriod: Record<string, number> = {};
        const fuelByPeriod: Record<string, number> = {};
        
        // Process data for charts in a single pass
        routesData.forEach(route => {
          if (!route.date) return;
          const periodKey = formatPeriodKey(route.date, timePeriod);
          deliveriesByPeriod[periodKey] = (deliveriesByPeriod[periodKey] || 0) + 1;
          fuelByPeriod[periodKey] = (fuelByPeriod[periodKey] || 0) + (route.estimated_cost || 0);
        });

        // Process delivery data
        const periodRouteIds = routesData.map(route => route.id) || [];
        const periodDeliveries = deliveriesData.filter(delivery => 
          periodRouteIds.includes(delivery.route_id || '')
        ) || [];

        // Map locations to deliveries
        const deliveriesByLocation: Record<string, number> = {};
        periodDeliveries.forEach(delivery => {
          if (!delivery.location_id) return;
          const location = locationsData.find(loc => loc.id === delivery.location_id);
          if (location) {
            const locationName = location.name;
            deliveriesByLocation[locationName] = (deliveriesByLocation[locationName] || 0) + (delivery.cylinders || 0);
          }
        });

        // Sort and format chart data
        let sortedDeliveriesByPeriod = sortByPeriod(Object.entries(deliveriesByPeriod), timePeriod);
        let sortedFuelByPeriod = sortByPeriod(Object.entries(fuelByPeriod), timePeriod);

        const monthlyDeliveriesData = sortedDeliveriesByPeriod.map(([name, value]) => ({ name, value }));
        const fuelConsumptionData = sortedFuelByPeriod.map(([name, value]) => ({ name, value }));

        const routeDistributionData = Object.entries(deliveriesByLocation)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Cost breakdown
        const totalCost = totalFuelCost;
        const fuelPercentage = 45; // 45% of total cost
        const maintenancePercentage = 20;
        const laborPercentage = 25;
        const otherPercentage = 10;

        const costBreakdownData = [
          { name: 'Fuel', value: Math.round((fuelPercentage / 100) * totalCost) },
          { name: 'Maintenance', value: Math.round((maintenancePercentage / 100) * totalCost) },
          { name: 'Labor', value: Math.round((laborPercentage / 100) * totalCost) },
          { name: 'Other', value: Math.round((otherPercentage / 100) * totalCost) }
        ];

        return {
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
        };
      };

      // Calculate metrics and update state
      const metrics = calculateMetrics();
      if (isMounted) {
        setAnalyticsData(metrics);
      }

      console.log('Analytics data loaded successfully');

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      if (isMounted) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    // Return a cleanup function to set isMounted to false
    return () => {
      isMounted = false;
    };
  }, [timePeriod]);

  // Effect to fetch data when timePeriod changes
  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [fetchData, timePeriod]);

  return {
    analyticsData,
    timePeriod,
    setTimePeriod,
    isLoading,
    fetchData
  };
};

// Re-export the types for convenience to consumers
export type { AnalyticsData, TimePeriod };
