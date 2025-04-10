
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
  
  // Fetch data on initial render and when date changes
  useEffect(() => {
    console.log("MonthlyReports: Date changed or component mounted, fetching data...");
    if (date) {
      fetchMonthlyData().catch(error => {
        console.error("Failed to fetch monthly data:", error);
        toast.error("Error loading monthly report data");
      });
    }
  }, [date, fetchMonthlyData]);

  // Show alert if no data is found after loading completes
  useEffect(() => {
    if (!isLoading) {
      console.log("Monthly data loading complete. Data found:", 
        weeklySummary.some(week => week.deliveries > 0));
      
      const noDataFound = weeklySummary.length === 0 || 
        weeklySummary.every(week => week.deliveries === 0);
      
      setShowAlert(noDataFound);
      
      if (noDataFound) {
        toast.warning("No delivery data found for this month", {
          description: "Try selecting a different month or check your data source"
        });
      } else if (weeklySummary.some(week => week.deliveries > 0)) {
        toast.success(`Loaded data for ${format(startOfMonth(date || new Date()), 'MMMM yyyy')}`);
      }
    }
  }, [weeklySummary, isLoading, date]);

  const handleRefresh = () => {
    console.log("Manually refreshing monthly data");
    toast.info("Refreshing monthly data");
    fetchMonthlyData().catch(error => {
      console.error("Failed to refresh monthly data:", error);
      toast.error("Error refreshing monthly report data");
    });
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
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading monthly data...</p>
              </div>
            ) : weeklySummary.length > 0 && weeklySummary.some(week => week.deliveries > 0) ? (
              <WeeklySummaryTable 
                weeklySummary={weeklySummary}
                monthlyTotals={monthlyTotals}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No delivery data found for this month.
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
