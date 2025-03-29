
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Sample data for daily deliveries (will be replaced with real data from Supabase)
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

const DailyReports = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState(sampleDeliveries);

  useEffect(() => {
    fetchDeliveryData();
  }, [date]);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const filteredDeliveries = deliveries.filter(
    delivery => delivery.date === formattedDate
  );

  // Calculate totals
  const totalCylinders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
  const totalKms = filteredDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
  const totalFuelCost = filteredDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);

  const fetchDeliveryData = async () => {
    // In a real implementation, we would fetch data from Supabase
    setIsLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Example of how we would fetch from Supabase
    // const { data, error } = await supabase
    //   .from('routes')
    //   .select('*, deliveries(*)')
    //   .eq('date', formattedDate);
    
    // if (data) {
    //   // Transform data to match our expected format
    //   const transformedData = data.flatMap(route => 
    //     route.deliveries.map(delivery => ({
    //       id: delivery.id,
    //       siteName: delivery.location_name,
    //       cylinders: delivery.cylinders,
    //       kms: route.total_distance / route.deliveries.length,
    //       fuelCost: route.estimated_cost / route.deliveries.length,
    //       date: route.date
    //     }))
    //   );
    //   setDeliveries(transformedData);
    // }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchDeliveryData();
  };

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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
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
            <CardTitle>Daily Deliveries: {formattedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Cylinders</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Fuel Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.siteName}</TableCell>
                      <TableCell>{delivery.cylinders}</TableCell>
                      <TableCell>{delivery.kms.toFixed(1)}</TableCell>
                      <TableCell>R{delivery.fuelCost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>TOTALS</TableCell>
                    <TableCell>{totalCylinders}</TableCell>
                    <TableCell>{totalKms.toFixed(1)}</TableCell>
                    <TableCell>R{totalFuelCost.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No deliveries found for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyReports;
