
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyDataSummary {
  date: Date;
  formattedDate: string;
  deliveries: number;
  totalCylinders: number;
  totalKms: number;
  totalFuelCost: number;
}

export interface WeeklyTotals {
  deliveries: number;
  cylinders: number;
  kms: number;
  fuelCost: number;
}

export const useWeeklyData = (date: Date | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<WeeklyDataSummary[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotals>({
    deliveries: 0,
    cylinders: 0,
    kms: 0,
    fuelCost: 0
  });

  useEffect(() => {
    if (date) {
      fetchWeeklyData();
    }
  }, [date]);

  const fetchWeeklyData = async () => {
    if (!date) return;
    
    setIsLoading(true);
    
    try {
      // Calculate week start and end dates
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
      
      // Make weekEnd include the entire day
      const adjustedWeekEnd = new Date(weekEnd);
      adjustedWeekEnd.setHours(23, 59, 59, 999);
      
      console.log('Fetching routes for week between:', weekStart.toISOString(), 'and', adjustedWeekEnd.toISOString());
      
      // Fetch routes for the entire week with improved date range filtering
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
        .gte('date', weekStart.toISOString())
        .lte('date', adjustedWeekEnd.toISOString())
        .order('date', { ascending: true });
      
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        throw routesError;
      }
      
      console.log('Found routes for week:', routesData?.length || 0);
      
      // Create daily summary data structure
      const weekData: WeeklyDataSummary[] = Array.from({ length: 7 }, (_, i) => {
        const currentDate = addDays(weekStart, i);
        const formattedDateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Filter routes for current day
        const dayRoutes = routesData?.filter(route => {
          const routeDate = new Date(route.date);
          return format(routeDate, 'yyyy-MM-dd') === formattedDateStr;
        }) || [];
        
        // Calculate totals for the day
        const deliveriesCount = dayRoutes.length;
        const totalCylinders = dayRoutes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
        const totalKms = dayRoutes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
        const totalFuelCost = dayRoutes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
        
        return {
          date: currentDate,
          formattedDate: format(currentDate, 'EEE, MMM d'),
          deliveries: deliveriesCount,
          totalCylinders,
          totalKms,
          totalFuelCost
        };
      });
      
      // Calculate weekly totals
      const totals: WeeklyTotals = {
        deliveries: weekData.reduce((sum, day) => sum + day.deliveries, 0),
        cylinders: weekData.reduce((sum, day) => sum + day.totalCylinders, 0),
        kms: weekData.reduce((sum, day) => sum + day.totalKms, 0),
        fuelCost: weekData.reduce((sum, day) => sum + day.totalFuelCost, 0)
      };
      
      setDailySummary(weekData);
      setWeeklyTotals(totals);
      
      if (totals.deliveries > 0) {
        toast.success(`Loaded data for week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`);
      } else {
        toast.info(`No deliveries found for week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast.error('Failed to load weekly data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dailySummary,
    weeklyTotals,
    isLoading,
    fetchWeeklyData
  };
};
