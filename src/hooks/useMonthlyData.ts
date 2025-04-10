
import { useState, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  startOfWeek, 
  endOfWeek,
  parseISO
} from 'date-fns';
import { toast } from 'sonner';
import { fetchRoutesByDateRange } from './delivery/deliveryQueries';

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

  const fetchMonthlyData = useCallback(async () => {
    if (!date) {
      console.error("Cannot fetch monthly data: date is undefined");
      return;
    }
    
    setIsLoading(true);
    console.log("useMonthlyData: Starting fetch with date:", format(date, 'yyyy-MM-dd'));
    
    try {
      // Calculate month start and end dates
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      console.log('Fetching routes for month between:', 
        `${format(monthStart, 'yyyy-MM-dd')} (${monthStart.toISOString()})`,
        'and', 
        `${format(monthEnd, 'yyyy-MM-dd')} (${monthEnd.toISOString()})`);
      
      // Fetch routes data
      const routesData = await fetchRoutesByDateRange(monthStart, monthEnd);
      
      console.log('Found routes for month:', routesData?.length || 0);
      if (routesData && routesData.length > 0) {
        console.log('First route:', routesData[0]);
        console.log('Last route:', routesData[routesData.length - 1]);
      }
      
      // Get all weeks in the month - using weekStartsOn: 1 for Monday start
      const weeksInMonth = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 } // Start weeks on Monday
      );
      
      console.log(`Month has ${weeksInMonth.length} weeks`);
      
      // Create weekly summary data structure
      const monthData: MonthlyDataSummary[] = weeksInMonth.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        
        // For comparison, convert dates to yyyy-MM-dd format
        const weekStartFormatted = format(weekStart, 'yyyy-MM-dd');
        const weekEndFormatted = format(weekEnd, 'yyyy-MM-dd');
        
        console.log(`Processing week ${index + 1}: ${weekStartFormatted} to ${weekEndFormatted}`);
        
        // Filter routes for current week
        const weekRoutes = routesData?.filter(route => {
          if (!route.date) return false;
          
          // Parse the route date
          let routeDate;
          if (typeof route.date === 'string') {
            routeDate = parseISO(route.date);
          } else {
            routeDate = new Date(route.date);
          }
          
          // Format for comparison
          const routeDateFormatted = format(routeDate, 'yyyy-MM-dd');
          
          // Check if route date is within week range
          return routeDateFormatted >= weekStartFormatted && 
                 routeDateFormatted <= weekEndFormatted;
        }) || [];
        
        console.log(`Week ${index + 1} has ${weekRoutes.length} routes`);
        
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
      
      console.log("Month data processed:", monthData);
      console.log("Monthly totals:", totals);
      
      setWeeklySummary(monthData);
      setMonthlyTotals(totals);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      toast.error('Failed to load monthly data');
      throw error; // Rethrow to allow component to handle error
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  return {
    weeklySummary,
    monthlyTotals,
    isLoading,
    fetchMonthlyData
  };
};
