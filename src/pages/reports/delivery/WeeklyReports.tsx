
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import ReportTabs from '@/components/reports/ReportTabs';
import WeeklyCalendarCard from '@/components/reports/WeeklyCalendarCard';
import WeeklySummaryTable from '@/components/reports/WeeklySummaryTable';

// Sample data for daily deliveries
const sampleDeliveries = [
  { id: 1, siteName: 'Afrox Epping Depot', cylinders: 12, kms: 15.3, fuelCost: 24.50, date: '2023-07-10' },
  { id: 2, siteName: 'Food Lovers Sunningdale', cylinders: 8, kms: 8.7, fuelCost: 14.10, date: '2023-07-10' },
  { id: 3, siteName: 'Pick n Pay TableView', cylinders: 15, kms: 12.5, fuelCost: 20.30, date: '2023-07-10' },
  { id: 4, siteName: 'SUPERSPAR Parklands', cylinders: 10, kms: 9.8, fuelCost: 15.80, date: '2023-07-10' },
  { id: 5, siteName: 'West Coast Village', cylinders: 6, kms: 7.2, fuelCost: 11.60, date: '2023-07-11' },
  { id: 6, siteName: 'KWIKSPAR Paarl', cylinders: 9, kms: 18.5, fuelCost: 29.90, date: '2023-07-11' },
  { id: 7, siteName: 'SUPERSPAR Plattekloof', cylinders: 11, kms: 14.1, fuelCost: 22.80, date: '2023-07-11' },
  { id: 8, siteName: 'OK Foods Strand', cylinders: 7, kms: 25.3, fuelCost: 40.90, date: '2023-07-12' },
  { id: 9, siteName: 'OK Urban Sonstraal', cylinders: 14, kms: 16.8, fuelCost: 27.20, date: '2023-07-12' },
  { id: 10, siteName: 'Clara Anna', cylinders: 5, kms: 10.5, fuelCost: 16.90, date: '2023-07-12' },
];

const WeeklyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Calculate week start and end dates
  const weekStart = date ? startOfWeek(date, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = date ? endOfWeek(date, { weekStartsOn: 1 }) : endOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Format for display
  const weekRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  // Create daily summary for the selected week
  const dailySummary = Array.from({ length: 7 }, (_, i) => {
    const currentDate = addDays(weekStart, i);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    const dayDeliveries = sampleDeliveries.filter(
      delivery => delivery.date === formattedDate
    );
    
    const totalCylinders = dayDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
    const totalKms = dayDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
    const totalFuelCost = dayDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);
    
    return {
      date: currentDate,
      formattedDate: format(currentDate, 'EEE, MMM d'),
      deliveries: dayDeliveries.length,
      totalCylinders,
      totalKms,
      totalFuelCost
    };
  });

  // Calculate weekly totals
  const weeklyTotals = {
    deliveries: dailySummary.reduce((sum, day) => sum + day.deliveries, 0),
    cylinders: dailySummary.reduce((sum, day) => sum + day.totalCylinders, 0),
    kms: dailySummary.reduce((sum, day) => sum + day.totalKms, 0),
    fuelCost: dailySummary.reduce((sum, day) => sum + day.totalFuelCost, 0)
  };

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="weekly" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WeeklyCalendarCard 
          date={date}
          setDate={setDate}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Summary: {weekRange}</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklySummaryTable 
              dailySummary={dailySummary}
              weeklyTotals={weeklyTotals}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReports;
