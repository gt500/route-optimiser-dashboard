
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchAnalyticsData } from './analyticsDataFetcher';
import { processAnalyticsData } from './analyticsDataProcessor';
import type { TimePeriod, AnalyticsData } from '../analyticsTypes';
import { getPeriodDates } from '../analyticsDateUtils';

/**
 * Hook for fetching and managing analytics data
 */
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
      console.log(`Fetching analytics data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Fetch all required data
      const {
        routesData,
        prevRoutesData,
        deliveriesData,
        locationsData
      } = await fetchAnalyticsData(startDate, endDate, previousStartDate, previousEndDate);

      // Check if the component is still mounted before updating state
      if (!isMounted) return;

      // Process the data to calculate metrics and chart data
      const processedData = processAnalyticsData(
        routesData, 
        prevRoutesData, 
        deliveriesData, 
        locationsData,
        timePeriod
      );

      if (isMounted) {
        setAnalyticsData(processedData);
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
