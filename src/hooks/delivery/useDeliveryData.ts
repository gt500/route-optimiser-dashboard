
import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { DeliveryData, DeliveryHookReturn } from './types';
import { processDeliveryData } from './deliveryDataUtils';
import { 
  fetchRoutesByDateRange, 
  fetchRecentRoutes,
  fetchDeliveriesByRouteIds,
  fetchLocationsByIds
} from './deliveryQueries';

export const useDeliveryData = (date: Date | undefined): DeliveryHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);

  useEffect(() => {
    if (date) {
      fetchDeliveryData();
    }
  }, [date]);

  const fetchDeliveryData = async () => {
    if (!date) return;
    
    setIsLoading(true);
    const formattedDateStr = format(date, 'yyyy-MM-dd');
    
    try {
      // Improved date range handling for better accuracy
      const startOfSelectedDay = startOfDay(date);
      const endOfSelectedDay = endOfDay(date);

      // Fetch routes for the selected date
      const routesData = await fetchRoutesByDateRange(startOfSelectedDay, endOfSelectedDay);
      
      console.log('Found routes for date', formattedDateStr, ':', routesData.length || 0);
      
      // If no routes found for selected date, get recent routes as fallback
      if (routesData.length === 0) {
        console.log('No routes found for the selected date. Fetching recent routes instead.');
        
        const recentRoutesData = await fetchRecentRoutes(3);
        
        if (recentRoutesData.length === 0) {
          setDeliveries([]);
          setIsLoading(false);
          return;
        }
        
        // Use the recent routes data instead
        console.log('Using recent routes data instead:', recentRoutesData.length);
        
        // Get the first route date to display as fallback
        const firstRouteDate = new Date(recentRoutesData[0].date);
        const firstRouteDateStr = format(firstRouteDate, 'yyyy-MM-dd');
        
        const routeIds = recentRoutesData.map(route => route.id);
        await processRouteDeliveries(routeIds, recentRoutesData, firstRouteDateStr);
        return;
      }
      
      const routeIds = routesData.map(route => route.id);
      await processRouteDeliveries(routeIds, routesData, formattedDateStr);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process route deliveries
  const processRouteDeliveries = async (
    routeIds: string[],
    routesData: any[],
    formattedDateStr: string
  ) => {
    try {
      const deliveriesData = await fetchDeliveriesByRouteIds(routeIds);
      
      console.log('Found deliveries:', deliveriesData?.length || 0);
      
      if (!deliveriesData || deliveriesData.length === 0) {
        setDeliveries([]);
        return;
      }
      
      const locationIds = deliveriesData.map(delivery => delivery.location_id);
      const { locations: locationsData, includeRegionCountry } = await fetchLocationsByIds(locationIds);
      
      // Process and transform the data
      const transformedData = processDeliveryData(
        routesData, 
        deliveriesData, 
        locationsData, 
        formattedDateStr, 
        includeRegionCountry
      );
      
      setDeliveries(transformedData);
    } catch (error) {
      console.error('Error processing route deliveries:', error);
      toast.error('Failed to process delivery data');
      setDeliveries([]);
    }
  };

  return {
    deliveries,
    isLoading,
    fetchDeliveryData
  };
};
