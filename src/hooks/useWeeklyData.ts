
import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
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

  const fetchWeeklyData = useCallback(async () => {
    if (!date) return;
    
    setIsLoading(true);
    
    try {
      // Calculate week start and end dates - using weekStartsOn: 1 for Monday start
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      
      // Make weekEnd include the entire day (23:59:59.999)
      const adjustedWeekEnd = new Date(weekEnd);
      adjustedWeekEnd.setHours(23, 59, 59, 999);
      
      console.log('Fetching routes for week between:', 
        format(weekStart, 'yyyy-MM-dd'), 'and', 
        format(adjustedWeekEnd, 'yyyy-MM-dd'));
      
      // Use a more precise date range filtering with ISO strings
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
      
      console.log('Found routes for week:', routesData?.length || 0, routesData);
      
      // Create daily summary data structure with consistent date handling
      const weekData: WeeklyDataSummary[] = Array.from({ length: 7 }, (_, i) => {
        const currentDate = addDays(weekStart, i);
        const formattedDateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Filter routes for current day with more precise date comparison
        const dayRoutes = routesData?.filter(route => {
          if (!route.date) return false;
          
          // Parse the route date and format it to yyyy-MM-dd for comparison
          const routeDate = typeof route.date === 'string' 
            ? parseISO(route.date) 
            : new Date(route.date);
          
          const routeDateStr = format(routeDate, 'yyyy-MM-dd');
          
          return routeDateStr === formattedDateStr;
        }) || [];
        
        console.log(`Date ${formattedDateStr} has ${dayRoutes.length} routes`);
        
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
  }, [date]);

  // Don't use useEffect here, let the component trigger fetchWeeklyData

  return {
    dailySummary,
    weeklyTotals,
    isLoading,
    fetchWeeklyData
  };
};
