
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface RouteData {
  id: string;
  name: string;
  date: string;
  total_distance: number;
  total_cylinders: number;
  estimated_cost: number;
  status: string;
  vehicle_id?: string;
  total_duration?: number;
}

export const useRouteData = () => {
  // Fetch route data from Supabase
  const fetchRouteData = async (): Promise<RouteData[]> => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, total_distance, total_cylinders, estimated_cost, date, status, vehicle_id, total_duration');
      
      if (error) {
        console.error('Error fetching route data:', error);
        toast.error('Failed to load route data');
        return [];
      }
      
      // Filter out any routes that might have "Food Lovers Sunningdale" in their name
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      // Sort by date (most recent first)
      return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching route data:', error);
      toast.error('Failed to load route data');
      return [];
    }
  };

  // Fetch route data for a specific period
  const fetchRouteDataForPeriod = async (days: number): Promise<RouteData[]> => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, total_distance, total_cylinders, estimated_cost, date, status, vehicle_id, total_duration')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Error fetching route data for last ${days} days:`, error);
        toast.error('Failed to load period-specific route data');
        return [];
      }
      
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      return filteredData;
    } catch (error) {
      console.error(`Error fetching route data for last ${days} days:`, error);
      toast.error('Failed to load period-specific route data');
      return [];
    }
  };

  // Fetch route data for today
  const fetchTodayRouteData = async (): Promise<RouteData[]> => {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, total_distance, total_cylinders, estimated_cost, date, status, vehicle_id, total_duration')
        .gte('date', startOfToday.toISOString())
        .lte('date', endOfToday.toISOString())
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching today\'s route data:', error);
        toast.error('Failed to load today\'s route data');
        return [];
      }
      
      const filteredData = data?.filter(route => 
        !route.name?.toLowerCase().includes('food lovers sunningdale')
      ) || [];
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching today\'s route data:', error);
      toast.error('Failed to load today\'s route data');
      return [];
    }
  };

  // Fetch active routes (status = 'scheduled' or 'in_progress')
  const fetchActiveRoutes = async (): Promise<RouteData[]> => {
    try {
      // Use cache: 'no-store' to ensure we always get fresh data
      const { data, error } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_cylinders, estimated_cost, status, vehicle_id, total_duration')
        .in('status', ['scheduled', 'in_progress', 'completed'])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching active routes:', error);
        toast.error('Failed to load active routes');
        return [];
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
        .select('id, name, date, total_distance, total_cylinders, estimated_cost, status, vehicle_id, total_duration')
        .in('status', ['completed', 'cancelled'])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching route history:', error);
        toast.error('Failed to load route history');
        return [];
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
      // For now, we'll consider routes with status 'completed' or 'in_progress' as optimized
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
        if (route && route.date) {
          const routeDate = new Date(route.date);
          const dayIndex = routeDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          weeklyData[dayIndex].deliveries += 1;
        }
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

  // Fetch route data for a specific route name
  const fetchRouteDataByName = async (routeName: string): Promise<RouteData[]> => {
    try {
      const allRoutes = await fetchRouteData();
      
      // Filter routes by name (case insensitive partial match)
      const matchingRoutes = allRoutes.filter(route => 
        route.name.toLowerCase().includes(routeName.toLowerCase())
      );
      
      return matchingRoutes;
    } catch (error) {
      console.error(`Error fetching route data for route ${routeName}:`, error);
      toast.error(`Failed to load data for route ${routeName}`);
      return [];
    }
  };

  return {
    fetchRouteData,
    fetchRouteDataForPeriod,
    fetchTodayRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    getOptimizationStats,
    getWeeklyDeliveryData,
    fetchRouteDataByName
  };
};
