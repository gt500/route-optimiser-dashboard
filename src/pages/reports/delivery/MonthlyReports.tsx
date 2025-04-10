
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReportTabs from '@/components/reports/ReportTabs';
import MonthlyCalendarCard from '@/components/reports/MonthlyCalendarCard';
import WeeklySummaryTable from '@/components/reports/WeeklySummaryTable';
import ReportMetricsGrid from '@/components/reports/ReportMetricsGrid';
import { useMonthlyData } from '@/hooks/useMonthlyData';

const MonthlyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  const { weeklySummary, monthlyTotals, isLoading, fetchMonthlyData } = useMonthlyData(date);
  
  // Ensure data is fetched when date changes
  useEffect(() => {
    if (date) {
      console.log("Fetching monthly reports with date:", format(date, 'yyyy-MM-dd'));
      fetchMonthlyData();
    }
  }, [date, fetchMonthlyData]);

  // Also fetch on component mount to ensure data is loaded
  useEffect(() => {
    if (date) {
      console.log("Initializing monthly reports with date:", format(date, 'yyyy-MM-dd'));
      fetchMonthlyData();
    }
  }, []);

  useEffect(() => {
    // Show alert if no data is found
    if (!isLoading && weeklySummary.length > 0 && weeklySummary.every(week => week.deliveries === 0)) {
      setShowAlert(true);
      toast.warning("No delivery data found for this month", {
        description: "Try selecting a different month or check your data source"
      });
    } else {
      setShowAlert(false);
    }
  }, [weeklySummary, isLoading]);

  const handleRefresh = () => {
    console.log("Manually refreshing monthly data");
    fetchMonthlyData();
    toast.info("Refreshing monthly data");
  };

  // Calculate month start and end dates
  const monthStart = date ? startOfMonth(date) : startOfMonth(new Date());
  const monthEnd = date ? endOfMonth(date) : endOfMonth(new Date());
  
  // Format for display
  const monthDisplay = format(monthStart, 'MMMM yyyy');

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="monthly" />
      
      {showAlert && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Found</AlertTitle>
          <AlertDescription>
            No delivery data was found for the selected month. Try selecting a different date range.
          </AlertDescription>
        </Alert>
      )}
      
      {weeklySummary.length > 0 && weeklySummary.some(week => week.deliveries > 0) && (
        <ReportMetricsGrid
          totalCylinders={monthlyTotals.cylinders}
          totalDistance={monthlyTotals.kms}
          totalLocations={monthlyTotals.deliveries}
          totalFuelCost={monthlyTotals.fuelCost}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MonthlyCalendarCard 
          date={date}
          setDate={setDate}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          weeklySummary={weeklySummary}
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary: {monthDisplay}</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklySummary.length > 0 && weeklySummary.some(week => week.deliveries > 0) ? (
              <WeeklySummaryTable 
                weeklySummary={weeklySummary}
                monthlyTotals={monthlyTotals}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  {isLoading 
                    ? "Loading monthly data..." 
                    : "No delivery data found for this month."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReports;
