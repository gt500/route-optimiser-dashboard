
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryData } from './types';
import { format } from 'date-fns';

export interface DashboardDeliveryData {
  id: string;
  name: string;
  date: string;
  locationsCount: number;
  cylindersCount: number;
  status: string;
}

export const useDeliveryData = (selectedDate?: Date) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);

  const fetchDeliveryData = useCallback(async (): Promise<void> => {
    if (!selectedDate) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch from database
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, date, total_cylinders, status, latitude, longitude, region, country, actual_distance, actual_duration, traffic, fuel_cost')
        .eq('date', dateStr)
        .order('name', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const mappedData: DeliveryData[] = data.map(item => ({
        id: item.id,
        siteName: item.name,
        date: item.date,
        cylinders: item.total_cylinders || 0,
        kms: item.actual_distance || 0,
        fuelCost: item.fuel_cost || 0,
        status: item.status,
        latitude: item.latitude,
        longitude: item.longitude,
        region: item.region,
        country: item.country,
        actualDistance: item.actual_distance,
        actualDuration: item.actual_duration,
        traffic: item.traffic
      }));
      
      setDeliveries(mappedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliveries';
      console.error('Error fetching deliveries:', errorMessage);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to load delivery data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Function for dashboard to fetch upcoming deliveries
  const fetchDeliveries = useCallback(async (): Promise<DeliveryData[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch upcoming deliveries for dashboard
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, date, total_cylinders, status')
        .eq('status', 'scheduled')
        .order('date', { ascending: true })
        .limit(5);
      
      if (error) {
        throw new Error(error.message);
      }
      
      const mappedData: DeliveryData[] = data.map(item => ({
        id: item.id,
        siteName: item.name,
        date: item.date,
        cylinders: item.total_cylinders || 0,
        kms: 0,
        fuelCost: 0,
        status: item.status
      }));
      
      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliveries';
      console.error('Error fetching deliveries:', errorMessage);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to load upcoming deliveries');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deliveries,
    isLoading,
    error,
    fetchDeliveryData,
    fetchDeliveries
  };
};
