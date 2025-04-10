
import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  startOfWeek, 
  endOfWeek,
  addDays
} from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyDataSummary {
  weekNumber: number;
  dateRange: string;
  deliveries: number;
  cylinders: number;
  kms: number;
  fuelCost: number;
}

export interface MonthlyTotals {
  deliveries: number;
  cylinders: number;
  kms: number;
  fuelCost: number;
}

export const useMonthlyData = (date: Date | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<MonthlyDataSummary[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals>({
    deliveries: 0,
    cylinders: 0,
    kms: 0,
    fuelCost: 0
  });

  useEffect(() => {
    if (date) {
      fetchMonthlyData();
    }
  }, [date]);

  const fetchMonthlyData = async () => {
    if (!date) return;
    
    setIsLoading(true);
    
    try {
      // Calculate month start and end dates
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Make monthEnd include the entire day
      const adjustedMonthEnd = new Date(monthEnd);
      adjustedMonthEnd.setHours(23, 59, 59, 999);
      
      console.log('Fetching routes for month between:', monthStart.toISOString(), 'and', adjustedMonthEnd.toISOString());
      
      // Fetch routes for the entire month with improved date range filtering
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status, total_cylinders')
        .gte('date', monthStart.toISOString())
        .lte('date', adjustedMonthEnd.toISOString())
        .order('date', { ascending: true });
      
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        throw routesError;
      }
      
      console.log('Found routes for month:', routesData?.length || 0);
      
      // Get all weeks in the month
      const weeksInMonth = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 } // Start weeks on Monday
      );
      
      // Create weekly summary data structure
      const monthData: MonthlyDataSummary[] = weeksInMonth.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        
        // Filter routes for current week
        const weekRoutes = routesData?.filter(route => {
          const routeDate = new Date(route.date);
          return routeDate >= weekStart && routeDate <= weekEnd;
        }) || [];
        
        // Calculate totals for the week
        const deliveriesCount = weekRoutes.length;
        const totalCylinders = weekRoutes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
        const totalKms = weekRoutes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
        const totalFuelCost = weekRoutes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
        
        return {
          weekNumber: index + 1,
          dateRange: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          deliveries: deliveriesCount,
          cylinders: totalCylinders,
          kms: totalKms,
          fuelCost: totalFuelCost
        };
      });
      
      // Calculate monthly totals
      const totals: MonthlyTotals = {
        deliveries: monthData.reduce((sum, week) => sum + week.deliveries, 0),
        cylinders: monthData.reduce((sum, week) => sum + week.cylinders, 0),
        kms: monthData.reduce((sum, week) => sum + week.kms, 0),
        fuelCost: monthData.reduce((sum, week) => sum + week.fuelCost, 0)
      };
      
      setWeeklySummary(monthData);
      setMonthlyTotals(totals);
      
      if (totals.deliveries > 0) {
        toast.success(`Loaded data for ${format(monthStart, 'MMMM yyyy')}`);
      } else {
        toast.info(`No deliveries found for ${format(monthStart, 'MMMM yyyy')}`);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      toast.error('Failed to load monthly data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    weeklySummary,
    monthlyTotals,
    isLoading,
    fetchMonthlyData
  };
};
