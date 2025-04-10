
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReportTabs from '@/components/reports/ReportTabs';
import WeeklyCalendarCard from '@/components/reports/WeeklyCalendarCard';
import WeeklySummaryTable from '@/components/reports/WeeklySummaryTable';
import ReportMetricsGrid from '@/components/reports/ReportMetricsGrid';
import { useWeeklyData } from '@/hooks/useWeeklyData';

const WeeklyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  const { dailySummary, weeklyTotals, isLoading, fetchWeeklyData } = useWeeklyData(date);
  
  // Fetch data on initial render and when date changes
  useEffect(() => {
    console.log("WeeklyReports: Date changed or component mounted, fetching data...");
    if (date) {
      fetchWeeklyData().catch(error => {
        console.error("Failed to fetch weekly data:", error);
        toast.error("Error loading weekly report data");
      });
    }
  }, [date, fetchWeeklyData]);

  // Show alert if no data is found after loading completes
  useEffect(() => {
    if (!isLoading) {
      console.log("Weekly data loading complete. Data found:", 
        dailySummary.some(day => day.deliveries > 0));
      
      const noDataFound = dailySummary.length === 0 || 
        dailySummary.every(day => day.deliveries === 0);
      
      setShowAlert(noDataFound);
      
      if (noDataFound) {
        toast.warning("No delivery data found for this week", {
          description: "Try selecting a different week or check your data source"
        });
      } else if (dailySummary.some(day => day.deliveries > 0)) {
        toast.success(`Loaded data for week of ${format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), 'MMM d')}`);
      }
    }
  }, [dailySummary, isLoading, date]);

  const handleRefresh = () => {
    console.log("Manually refreshing weekly data");
    toast.info("Refreshing weekly data");
    fetchWeeklyData().catch(error => {
      console.error("Failed to refresh weekly data:", error);
      toast.error("Error refreshing weekly report data");
    });
  };

  // Calculate week start and end dates
  const weekStart = date ? startOfWeek(date, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = date ? endOfWeek(date, { weekStartsOn: 1 }) : endOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Format for display
  const weekRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="weekly" />
      
      {showAlert && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Found</AlertTitle>
          <AlertDescription>
            No delivery data was found for the selected week. Try selecting a different date range.
          </AlertDescription>
        </Alert>
      )}
      
      {dailySummary.length > 0 && dailySummary.some(day => day.deliveries > 0) && (
        <ReportMetricsGrid
          totalCylinders={weeklyTotals.cylinders}
          totalDistance={weeklyTotals.kms}
          totalLocations={weeklyTotals.deliveries}
          totalFuelCost={weeklyTotals.fuelCost}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WeeklyCalendarCard 
          date={date}
          setDate={setDate}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          dailySummary={dailySummary}
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Summary: {weekRange}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading weekly data...</p>
              </div>
            ) : dailySummary.length > 0 && dailySummary.some(day => day.deliveries > 0) ? (
              <WeeklySummaryTable 
                dailySummary={dailySummary}
                weeklyTotals={weeklyTotals}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No delivery data found for this week.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReports;
