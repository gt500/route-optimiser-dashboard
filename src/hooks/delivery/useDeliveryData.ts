
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { useState, useEffect } from 'react';

export interface DeliveryData {
  id: string;
  name: string;
  date: string;
  locationsCount: number;
  cylindersCount: number;
  status: string;
}

export const useDeliveryData = () => {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchActiveRoutes } = useRouteData();
  
  // Transform route data to delivery format
  const transformRouteToDelivery = (route: RouteData): DeliveryData => ({
    id: route.id,
    name: route.name,
    date: route.date,
    locationsCount: route.stops?.length || 0,
    cylindersCount: route.total_cylinders || 0,
    status: route.status
  });
  
  // Fetch active routes and transform them to delivery format
  const fetchDeliveries = async () => {
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
  
  useEffect(() => {
    fetchDeliveries();
  }, []);
  
  return {
    deliveries,
    isLoading,
    fetchDeliveries,
    transformRouteToDelivery
  };
};
