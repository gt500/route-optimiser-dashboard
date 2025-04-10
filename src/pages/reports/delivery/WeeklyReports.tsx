
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import ReportTabs from '@/components/reports/ReportTabs';
import WeeklyCalendarCard from '@/components/reports/WeeklyCalendarCard';
import WeeklySummaryTable from '@/components/reports/WeeklySummaryTable';
import ReportMetricsGrid from '@/components/reports/ReportMetricsGrid';
import { useWeeklyData } from '@/hooks/useWeeklyData';

const WeeklyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { dailySummary, weeklyTotals, isLoading, fetchWeeklyData } = useWeeklyData(date);
  
  // Ensure data is fetched on component mount
  useEffect(() => {
    if (date) {
      fetchWeeklyData();
    }
  }, []);

  const handleRefresh = () => {
    fetchWeeklyData();
  };

  // Calculate week start and end dates
  const weekStart = date ? startOfWeek(date, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = date ? endOfWeek(date, { weekStartsOn: 1 }) : endOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Format for display
  const weekRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="weekly" />
      
      {dailySummary.length > 0 && (
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
            {dailySummary.length > 0 ? (
              <WeeklySummaryTable 
                dailySummary={dailySummary}
                weeklyTotals={weeklyTotals}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  {isLoading 
                    ? "Loading weekly data..." 
                    : "No delivery data found for this week."}
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
