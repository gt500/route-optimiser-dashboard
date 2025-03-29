
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth
} from 'date-fns';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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
  // Add more sample data for different weeks
  { id: 11, siteName: 'Food Lovers Cape Town', cylinders: 10, kms: 12.3, fuelCost: 19.90, date: '2023-07-17' },
  { id: 12, siteName: 'Pick n Pay Milnerton', cylinders: 13, kms: 10.7, fuelCost: 17.30, date: '2023-07-17' },
  { id: 13, siteName: 'SUPERSPAR Durbanville', cylinders: 9, kms: 15.5, fuelCost: 25.10, date: '2023-07-18' },
  { id: 14, siteName: 'West Coast Mall', cylinders: 8, kms: 9.2, fuelCost: 14.90, date: '2023-07-18' },
  { id: 15, siteName: 'KWIKSPAR Stellenbosch', cylinders: 7, kms: 22.5, fuelCost: 36.40, date: '2023-07-19' },
];

const MonthlyReports = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'daily':
        navigate('/reports/delivery/daily');
        break;
      case 'weekly':
        navigate('/reports/delivery/weekly');
        break;
      case 'monthly':
        navigate('/reports/delivery/monthly');
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Calculate month start and end dates
  const monthStart = date ? startOfMonth(date) : startOfMonth(new Date());
  const monthEnd = date ? endOfMonth(date) : endOfMonth(new Date());
  
  // Format for display
  const monthDisplay = format(monthStart, 'MMMM yyyy');

  // Get weeks in the month
  const weeksInMonth = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  // Create weekly summary for the selected month
  const weeklySummary = weeksInMonth.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    // Check if this week has days in the selected month
    const hasRelevantDays = isSameMonth(weekStart, monthStart) || isSameMonth(weekEnd, monthStart);
    
    if (!hasRelevantDays) return null;
    
    // Filter deliveries for this week
    const weekDeliveries = sampleDeliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date);
      return deliveryDate >= weekStart && deliveryDate <= weekEnd;
    });
    
    const totalDeliveries = weekDeliveries.length;
    const totalCylinders = weekDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
    const totalKms = weekDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
    const totalFuelCost = weekDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);
    
    return {
      weekNumber: index + 1,
      dateRange: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
      totalDeliveries,
      totalCylinders,
      totalKms,
      totalFuelCost
    };
  }).filter(Boolean);

  // Calculate monthly totals
  const monthlyTotals = {
    deliveries: weeklySummary.reduce((sum, week) => sum + (week?.totalDeliveries || 0), 0),
    cylinders: weeklySummary.reduce((sum, week) => sum + (week?.totalCylinders || 0), 0),
    kms: weeklySummary.reduce((sum, week) => sum + (week?.totalKms || 0), 0),
    fuelCost: weeklySummary.reduce((sum, week) => sum + (week?.totalFuelCost || 0), 0)
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="monthly" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={handleRefresh} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
                  </>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary: {monthDisplay}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Cylinders</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Fuel Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklySummary.map((week) => (
                  <TableRow key={week.weekNumber}>
                    <TableCell>Week {week.weekNumber}</TableCell>
                    <TableCell>{week.dateRange}</TableCell>
                    <TableCell>{week.totalDeliveries}</TableCell>
                    <TableCell>{week.totalCylinders}</TableCell>
                    <TableCell>{week.totalKms.toFixed(1)}</TableCell>
                    <TableCell>R{week.totalFuelCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={2}>MONTHLY TOTALS</TableCell>
                  <TableCell>{monthlyTotals.deliveries}</TableCell>
                  <TableCell>{monthlyTotals.cylinders}</TableCell>
                  <TableCell>{monthlyTotals.kms.toFixed(1)}</TableCell>
                  <TableCell>R{monthlyTotals.fuelCost.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReports;
