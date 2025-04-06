
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ReportTabs from '@/components/reports/ReportTabs';
import MonthlyCalendarCard from '@/components/reports/MonthlyCalendarCard';
import WeeklySummaryTable from '@/components/reports/WeeklySummaryTable';
import ReportMetricsGrid from '@/components/reports/ReportMetricsGrid';
import { useMonthlyData } from '@/hooks/useMonthlyData';

const MonthlyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { weeklySummary, monthlyTotals, isLoading, fetchMonthlyData } = useMonthlyData(date);

  const handleRefresh = () => {
    fetchMonthlyData();
  };

  // Calculate month start and end dates
  const monthStart = date ? startOfMonth(date) : startOfMonth(new Date());
  const monthEnd = date ? endOfMonth(date) : endOfMonth(new Date());
  
  // Format for display
  const monthDisplay = format(monthStart, 'MMMM yyyy');

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="monthly" />
      
      {weeklySummary.length > 0 && (
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
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary: {monthDisplay}</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklySummary.length > 0 ? (
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
