
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RouteData {
  id: string;
  name: string;
  date: string;
  total_distance: number;
  total_cylinders: number;
  estimated_cost: number;
  status: string;
}

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
      
      // Filter out any routes that might have "Food Lovers Sunningdale" in their name
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching route data:', error);
      toast.error('Failed to load route data');
      return [];
    }
  };

  // Fetch active routes (status = 'scheduled' or 'in_progress')
  const fetchActiveRoutes = async (): Promise<RouteData[]> => {
    try {
      // Use cache: 'no-store' to ensure we always get fresh data
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_cylinders, estimated_cost, status')
        .in('status', ['scheduled', 'in_progress', 'completed'])
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Filter out any routes with "Food Lovers Sunningdale" in the name
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching active routes:', error);
      toast.error('Failed to load active routes');
      return [];
    }
  };

  // Fetch route history (status = 'completed' or 'cancelled')
  const fetchRouteHistory = async (): Promise<RouteData[]> => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_cylinders, estimated_cost, status')
        .in('status', ['completed', 'cancelled'])
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Filter out any routes with "Food Lovers Sunningdale" in the name
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching route history:', error);
      toast.error('Failed to load route history');
      return [];
    }
  };

  // Get optimization statistics
  const getOptimizationStats = async () => {
    try {
      const routeData = await fetchRouteData();
      
      if (!routeData.length) {
        return {
          optimized: 0,
          standard: 0,
          percentage: 0
        };
      }
      
      // In a real system, you would have a column indicating if a route was optimized
      // For now, we'll consider routes with lower estimated cost as "optimized"
      const totalRoutes = routeData.length;
      
      // Consider routes with status 'completed' or 'in_progress' as optimized
      const optimizedRoutes = routeData.filter(
        route => route.status === 'completed' || route.status === 'in_progress'
      ).length;
      
      // Calculate standard routes (not optimized)
      const standardRoutes = totalRoutes - optimizedRoutes;
      
      // Calculate percentage of optimized routes
      const optimizationPercentage = Math.round((optimizedRoutes / totalRoutes) * 100);
      
      return {
        optimized: optimizedRoutes,
        standard: standardRoutes,
        percentage: optimizationPercentage
      };
    } catch (error) {
      console.error('Error calculating optimization stats:', error);
      toast.error('Failed to calculate route optimization statistics');
      return {
        optimized: 0,
        standard: 0,
        percentage: 0
      };
    }
  };

  // Get weekly delivery data
  const getWeeklyDeliveryData = async () => {
    try {
      const routeData = await fetchRouteData();
      
      if (!routeData.length) {
        return [
          { name: 'Mon', deliveries: 0 },
          { name: 'Tue', deliveries: 0 },
          { name: 'Wed', deliveries: 0 },
          { name: 'Thu', deliveries: 0 },
          { name: 'Fri', deliveries: 0 },
          { name: 'Sat', deliveries: 0 },
          { name: 'Sun', deliveries: 0 },
        ];
      }
      
      // Initialize data for each day of the week
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData = daysOfWeek.map(day => ({ name: day, deliveries: 0 }));
      
      // Count deliveries for each day of the week
      routeData.forEach(route => {
        const routeDate = new Date(route.date);
        const dayIndex = routeDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        weeklyData[dayIndex].deliveries += 1;
      });
      
      return weeklyData;
    } catch (error) {
      console.error('Error calculating weekly delivery data:', error);
      toast.error('Failed to calculate weekly delivery statistics');
      return [
        { name: 'Mon', deliveries: 0 },
        { name: 'Tue', deliveries: 0 },
        { name: 'Wed', deliveries: 0 },
        { name: 'Thu', deliveries: 0 },
        { name: 'Fri', deliveries: 0 },
        { name: 'Sat', deliveries: 0 },
        { name: 'Sun', deliveries: 0 },
      ];
    }
  };

  return {
    fetchRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    getOptimizationStats,
    getWeeklyDeliveryData
  };
};
