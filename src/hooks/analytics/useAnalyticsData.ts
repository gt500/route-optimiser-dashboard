
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchInProgressRef = useRef(false);
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
    // Prevent duplicate fetches with a ref instead of state to avoid re-renders
    if (fetchInProgressRef.current) {
      console.log('Analytics fetch already in progress, skipping duplicate fetch');
      return;
    }
    
    // Set our ref to indicate fetch is in progress
    fetchInProgressRef.current = true;
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

      // Process the data to calculate metrics and chart data
      const processedData = processAnalyticsData(
        routesData, 
        prevRoutesData, 
        deliveriesData, 
        locationsData,
        timePeriod
      );

      setAnalyticsData(processedData);
      setIsInitialized(true);
      console.log('Analytics data loaded successfully');

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
      // Reset our ref to indicate fetch is complete
      fetchInProgressRef.current = false;
    }
  }, [timePeriod]); // Only timePeriod is a dependency now

  // Effect to fetch data when timePeriod changes, but only once per change
  useEffect(() => {
    // Only fetch if not initialized or if time period changes after initialization
    if (!isInitialized || timePeriod) {
      fetchData();
    }
    
    // No need for a cleanup function with our new approach
  }, [fetchData, timePeriod, isInitialized]);

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
