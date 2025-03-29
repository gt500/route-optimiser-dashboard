
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

interface DeliveryData {
  id: string;
  siteName: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  date: string;
}

interface RouteDelivery {
  routeId: string;
  routeName: string;
  date: string;
  totalDistance: number;
  totalDuration: number;
  estimatedCost: number;
  deliveries: {
    id: string;
    locationName: string;
    cylinders: number;
    sequence: number;
  }[];
}

const DailyReports = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);

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
    if (!date) return;
    
    setIsLoading(true);
    const formattedDateStr = format(date, 'yyyy-MM-dd');
    
    try {
      // Fetch routes for the selected date
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status')
        .eq('date', formattedDateStr)
        .order('created_at', { ascending: false });
      
      if (routesError) throw routesError;
      
      if (!routesData || routesData.length === 0) {
        setDeliveries([]);
        setIsLoading(false);
        return;
      }
      
      // Collect all route IDs
      const routeIds = routesData.map(route => route.id);
      
      // Fetch all related deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, route_id, location_id, cylinders, sequence')
        .in('route_id', routeIds);
      
      if (deliveriesError) throw deliveriesError;
      
      // Get all location IDs to fetch location details
      const locationIds = deliveriesData.map(delivery => delivery.location_id);
      
      // Fetch location details
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address, latitude, longitude')
        .in('id', locationIds);
      
      if (locationsError) throw locationsError;
      
      // Create a map of locations for easy lookup
      const locationsMap = (locationsData || []).reduce((acc, location) => {
        acc[location.id] = location;
        return acc;
      }, {});
      
      // Create a structured representation of routes with their deliveries
      const routeDeliveries: RouteDelivery[] = routesData.map(route => {
        const routeDeliveries = deliveriesData
          .filter(delivery => delivery.route_id === route.id)
          .map(delivery => ({
            id: delivery.id,
            locationName: locationsMap[delivery.location_id]?.name || 'Unknown Location',
            cylinders: delivery.cylinders,
            sequence: delivery.sequence
          }))
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
          
        return {
          routeId: route.id,
          routeName: route.name,
          date: route.date,
          totalDistance: route.total_distance || 0,
          totalDuration: route.total_duration || 0,
          estimatedCost: route.estimated_cost || 0,
          deliveries: routeDeliveries
        };
      });
      
      // Transform the data into the format needed for the table
      const transformedData: DeliveryData[] = [];
      
      routeDeliveries.forEach(route => {
        // Calculate km per delivery by dividing total distance by number of deliveries
        const deliveriesCount = route.deliveries.length;
        const kmsPerDelivery = deliveriesCount > 0 ? route.totalDistance / deliveriesCount : 0;
        const costPerDelivery = deliveriesCount > 0 ? route.estimatedCost / deliveriesCount : 0;
        
        route.deliveries.forEach(delivery => {
          transformedData.push({
            id: delivery.id,
            siteName: delivery.locationName,
            cylinders: delivery.cylinders,
            kms: parseFloat(kmsPerDelivery.toFixed(1)),
            fuelCost: parseFloat(costPerDelivery.toFixed(2)),
            date: formattedDateStr
          });
        });
      });
      
      setDeliveries(transformedData);
      
      if (transformedData.length > 0) {
        toast.success(`Loaded ${transformedData.length} deliveries for ${formattedDateStr}`);
      } else {
        toast.info(`No deliveries found for ${formattedDateStr}`);
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setIsLoading(false);
    }
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
                <p className="text-muted-foreground">
                  {isLoading 
                    ? "Loading delivery data..." 
                    : "No deliveries found for this date."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyReports;
