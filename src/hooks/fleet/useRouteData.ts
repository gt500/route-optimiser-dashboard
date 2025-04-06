
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRouteData = () => {
  // Fetch route data from Supabase
  const fetchRouteData = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, total_distance, total_cylinders, estimated_cost, date, status');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching route data:', error);
      toast.error('Failed to load route data');
      return [];
    }
  };

  return {
    fetchRouteData,
  };
};
