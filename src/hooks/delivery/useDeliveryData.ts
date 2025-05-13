import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Using types from your existing imports
export interface DashboardDeliveryData {
  id: string;
  name: string;
  date: string;
  locationsCount: number;
  cylindersCount: number;
  status: string;
}

export interface DeliveryData {
  id: string;
  siteName: string;
  date: string;
  cylinders: number;
  status: string;
}

export const useDeliveryData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData[]>([]);

  const fetchDeliveries = useCallback(async (): Promise<DeliveryData[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If we already have deliveries loaded, return them
      if (deliveryData.length > 0) {
        return deliveryData;
      }
      
      // Otherwise fetch from database
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
        cylinders: item.total_cylinders,
        status: item.status
      }));
      
      setDeliveryData(mappedData);
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
  }, [deliveryData]);

  return {
    isLoading,
    error,
    deliveryData,
    fetchDeliveries
  };
};
