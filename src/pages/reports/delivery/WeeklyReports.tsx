
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
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
];

const WeeklyReports = () => {
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
      <Tabs defaultValue="weekly" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Week</CardTitle>
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
            <CardTitle>Weekly Summary: {weekRange}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Cylinders</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Fuel Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySummary.map((day) => (
                  <TableRow key={day.formattedDate}>
                    <TableCell>{day.formattedDate}</TableCell>
                    <TableCell>{day.deliveries}</TableCell>
                    <TableCell>{day.totalCylinders}</TableCell>
                    <TableCell>{day.totalKms.toFixed(1)}</TableCell>
                    <TableCell>R{day.totalFuelCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>WEEKLY TOTALS</TableCell>
                  <TableCell>{weeklyTotals.deliveries}</TableCell>
                  <TableCell>{weeklyTotals.cylinders}</TableCell>
                  <TableCell>{weeklyTotals.kms.toFixed(1)}</TableCell>
                  <TableCell>R{weeklyTotals.fuelCost.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReports;
