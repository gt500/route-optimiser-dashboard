
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// Sample data for daily deliveries
const sampleDeliveries = [
  { id: 1, siteName: 'Afrox Epping Depot', cylinders: 12, date: '2023-07-10' },
  { id: 2, siteName: 'Food Lovers Sunningdale', cylinders: 8, date: '2023-07-10' },
  { id: 3, siteName: 'Pick n Pay TableView', cylinders: 15, date: '2023-07-10' },
  { id: 4, siteName: 'SUPERSPAR Parklands', cylinders: 10, date: '2023-07-10' },
  { id: 5, siteName: 'West Coast Village', cylinders: 6, date: '2023-07-11' },
  { id: 6, siteName: 'KWIKSPAR Paarl', cylinders: 9, date: '2023-07-11' },
  { id: 7, siteName: 'SUPERSPAR Plattekloof', cylinders: 11, date: '2023-07-11' },
  { id: 8, siteName: 'OK Foods Strand', cylinders: 7, date: '2023-07-12' },
  { id: 9, siteName: 'OK Urban Sonstraal', cylinders: 14, date: '2023-07-12' },
  { id: 10, siteName: 'Clara Anna', cylinders: 5, date: '2023-07-12' },
];

const DailyReports = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const filteredDeliveries = sampleDeliveries.filter(
    delivery => delivery.date === formattedDate
  );

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
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
              <Button variant="outline" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
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
                    <TableHead>Cylinders Delivered</TableHead>
                    <TableHead>Date of Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.siteName}</TableCell>
                      <TableCell>{delivery.cylinders}</TableCell>
                      <TableCell>{delivery.date}</TableCell>
                    </TableRow>
                  ))}
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
