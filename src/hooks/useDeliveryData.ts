
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryData {
  id: string;
  siteName: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  date: string;
  latitude?: number;
  longitude?: number;
}

export const useDeliveryData = (date: Date | undefined) => {
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
      const startOfDay = new Date(formattedDateStr);
      const endOfDay = new Date(formattedDateStr);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Fetching routes between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());
      
      // Update the query to use explicit timestamps for better accuracy
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString()) // Changed to lte to include the end of day
        .order('created_at', { ascending: false });
      
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        throw routesError;
      }
      
      console.log('Found routes for date', formattedDateStr, ':', routesData?.length || 0);
      
      if (!routesData || routesData.length === 0) {
        setDeliveries([]);
        setIsLoading(false);
        return;
      }
      
      const routeIds = routesData.map(route => route.id);
      
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, route_id, location_id, cylinders, sequence')
        .in('route_id', routeIds);
      
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
        throw deliveriesError;
      }
      
      console.log('Found deliveries:', deliveriesData?.length || 0);
      
      if (!deliveriesData || deliveriesData.length === 0) {
        setDeliveries([]);
        setIsLoading(false);
        return;
      }
      
      const locationIds = deliveriesData.map(delivery => delivery.location_id);
      
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address, latitude, longitude')
        .in('id', locationIds);
      
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }
      
      const locationsMap = (locationsData || []).reduce((acc: Record<string, any>, location) => {
        acc[location.id] = location;
        return acc;
      }, {});
      
      const routeDeliveries = routesData.map(route => {
        const routeDeliveries = deliveriesData
          .filter(delivery => delivery.route_id === route.id)
          .map(delivery => {
            const location = locationsMap[delivery.location_id];
            return {
              id: delivery.id,
              locationName: location?.name || 'Unknown Location',
              cylinders: delivery.cylinders,
              sequence: delivery.sequence,
              latitude: location?.latitude,
              longitude: location?.longitude
            };
          })
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
          
        return {
          routeId: route.id,
          routeName: route.name,
          date: route.date,
          totalDistance: route.total_distance || 0,
          totalDuration: route.total_duration || 0,
          estimatedCost: route.estimated_cost || 0,
          deliveries: routeDeliveries,
          totalCylinders: route.total_cylinders || 0
        };
      });
      
      console.log('Processed route deliveries:', routeDeliveries.length);
      
      const transformedData: DeliveryData[] = [];
      
      routeDeliveries.forEach(route => {
        const deliveriesCount = route.deliveries.length;
        const kmsPerDelivery = deliveriesCount > 0 ? route.totalDistance / deliveriesCount : 0;
        const costPerDelivery = deliveriesCount > 0 ? route.estimatedCost / deliveriesCount : 0;
        
        route.deliveries.forEach(delivery => {
          transformedData.push({
            id: delivery.id,
            siteName: delivery.locationName,
            cylinders: delivery.cylinders,
            kms: parseFloat(kmsPerDelivery.toFixed(1)),
            fuelCost: parseFloat(costPerDelivery.toFixed(2)),
            date: formattedDateStr,
            latitude: delivery.latitude,
            longitude: delivery.longitude
          });
        });
      });
      
      console.log('Final transformed data:', transformedData.length);
      setDeliveries(transformedData);
      
      if (transformedData.length > 0) {
        toast.success(`Loaded ${transformedData.length} deliveries for ${formattedDateStr}`);
      } else {
        toast.info(`No deliveries found for ${formattedDateStr}`);
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deliveries,
    isLoading,
    fetchDeliveryData
  };
};
