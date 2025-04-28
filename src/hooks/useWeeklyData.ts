
import { useState, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { fetchRoutesByDateRange } from './delivery/deliveryQueries';

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
    if (!date) {
      console.error("Cannot fetch weekly data: date is undefined");
      return;
    }
    
    setIsLoading(true);
    console.log("useWeeklyData: Starting fetch with date:", format(date, 'yyyy-MM-dd'));
    
    try {
      // Calculate week start and end dates - using weekStartsOn: 1 for Monday start
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      
      console.log('Fetching routes for week between:', 
        `${format(weekStart, 'yyyy-MM-dd')} (${weekStart.toISOString()})`,
        'and', 
        `${format(weekEnd, 'yyyy-MM-dd')} (${weekEnd.toISOString()})`);
      
      // Fetch routes data
      const routesData = await fetchRoutesByDateRange(weekStart, weekEnd);
      
      console.log('Found routes for week:', routesData?.length || 0);
      if (routesData && routesData.length > 0) {
        console.log('First route:', routesData[0]);
        console.log('Last route:', routesData[routesData.length - 1]);
      }
      
      // Create daily summary data structure with consistent date handling
      const weekData: WeeklyDataSummary[] = Array.from({ length: 7 }, (_, i) => {
        const currentDate = addDays(weekStart, i);
        const formattedDateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Filter routes for current day with more precise date comparison
        const dayRoutes = routesData?.filter(route => {
          if (!route.date) return false;
          
          // Parse the route date
          const routeDate = typeof route.date === 'string' 
            ? parseISO(route.date) 
            : new Date(route.date);
          
          // Format for comparison
          const routeDateStr = format(routeDate, 'yyyy-MM-dd');
          
          const isMatching = routeDateStr === formattedDateStr;
          return isMatching;
        }) || [];
        
        console.log(`Date ${formattedDateStr} has ${dayRoutes.length} routes`);
        
        // Calculate totals for the day
        const deliveriesCount = dayRoutes.length;
        const totalCylinders = dayRoutes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
        
        // Ensure distance is at least 5.0 km per delivery if it's missing
        let totalKms = dayRoutes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
        if (totalKms === 0 && deliveriesCount > 0) {
          totalKms = 5.0 * deliveriesCount;
        }
        
        // Ensure fuel cost is at least 73.72 per delivery if it's missing
        let totalFuelCost = dayRoutes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
        if (totalFuelCost === 0 && deliveriesCount > 0) {
          totalFuelCost = 73.72 * deliveriesCount;
        }
        
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
      
      console.log("Week data processed:", weekData);
      console.log("Weekly totals:", totals);
      
      setDailySummary(weekData);
      setWeeklyTotals(totals);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast.error('Failed to load weekly data');
      throw error; // Rethrow to allow component to handle error
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  return {
    dailySummary,
    weeklyTotals,
    isLoading,
    fetchWeeklyData
  };
};
