
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DeliveryData as DeliveryDataType } from './types';

// Define the interface for the hook's return type
interface UseDeliveryDataReturn {
  deliveries: DeliveryDataType[];
  isLoading: boolean;
  fetchDeliveryData: () => Promise<DeliveryDataType[]>;
  fetchDeliveries: () => Promise<DeliveryDataType[]>;
  transformRouteToDelivery: (route: RouteData) => DeliveryDataType;
}

// This interface is for the dashboard display - renamed to make the distinction clearer
export interface DashboardDeliveryData {
  id: string;
  name: string;
  date: string;
  locationsCount: number;
  cylindersCount: number;
  status: string;
}

export const useDeliveryData = (selectedDate?: Date | undefined): UseDeliveryDataReturn => {
  const [deliveries, setDeliveries] = useState<DeliveryDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchActiveRoutes } = useRouteData();
  
  // Transform route data to delivery format for the dashboard
  const transformRouteToDelivery = (route: RouteData): DeliveryDataType => ({
    id: route.id,
    siteName: route.name,
    cylinders: route.total_cylinders || 0,
    kms: route.total_distance || 0,
    fuelCost: route.estimated_cost || 0,
    date: format(new Date(route.date), 'yyyy-MM-dd'),
    latitude: 0, // Default values since we're not provided this in the route data
    longitude: 0, // Default values since we're not provided this in the route data
    region: '', // Default value
    country: '' // Default value
  });
  
  // Fetch active routes and transform them to delivery format
  const fetchDeliveries = async (): Promise<DeliveryDataType[]> => {
    setIsLoading(true);
    try {
      const routes = await fetchActiveRoutes();
      const transformedDeliveries = routes.map(transformRouteToDelivery);
      setDeliveries(transformedDeliveries);
      return transformedDeliveries;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add this method to maintain compatibility with DailyReports component
  const fetchDeliveryData = async (): Promise<DeliveryDataType[]> => {
    return fetchDeliveries();
  };
  
  useEffect(() => {
    fetchDeliveries();
  }, [selectedDate]);
  
  return {
    deliveries,
    isLoading,
    fetchDeliveries,
    fetchDeliveryData,
    transformRouteToDelivery
  };
};
