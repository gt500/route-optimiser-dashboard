
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Download, FileSpreadsheet, RefreshCw, MapPin, Clock, Fuel, Truck } from 'lucide-react';
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
import RouteMap from '@/components/routes/RouteMap';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';

interface DeliveryData {
  id: string;
  siteName: string;
  cylinders: number;
  kms: number;
  fuelCost: number;
  date: string;
  latitude?: number;
  longitude?: number;
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
    latitude?: number;
    longitude?: number;
  }[];
}

const DailyReports = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  useEffect(() => {
    fetchDeliveryData();
  }, [date]);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const filteredDeliveries = deliveries.filter(
    delivery => delivery.date === formattedDate
  );

  const totalCylinders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
  const totalKms = filteredDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
  const totalFuelCost = filteredDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);

  const fetchDeliveryData = async () => {
    if (!date) return;
    
    setIsLoading(true);
    const formattedDateStr = format(date, 'yyyy-MM-dd');
    
    try {
      // Fix: Use a more reliable approach to filter date values in Supabase
      // Instead of using the 'like' operator, we'll use 'gte' and 'lt' to define a date range
      const startOfDay = new Date(formattedDateStr);
      const endOfDay = new Date(formattedDateStr);
      endOfDay.setDate(endOfDay.getDate() + 1);

      console.log('Fetching routes between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());
      
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, date, total_distance, total_duration, estimated_cost, status')
        .gte('date', startOfDay.toISOString())
        .lt('date', endOfDay.toISOString())
        .order('created_at', { ascending: false });
      
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        throw routesError;
      }
      
      if (!routesData || routesData.length === 0) {
        setDeliveries([]);
        setIsLoading(false);
        return;
      }
      
      const routeIds = routesData.map(route => route.id);
      
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('id, route_id, location_id, cylinders, sequence')
        .in('route_id', routeIds);
      
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
        throw deliveriesError;
      }
      
      const locationIds = deliveriesData.map(delivery => delivery.location_id);
      
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address, latitude, longitude')
        .in('id', locationIds);
      
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }
      
      const locationsMap = (locationsData || []).reduce((acc: Record<string, any>, location) => {
        acc[location.id] = location;
        return acc;
      }, {});
      
      const routeDeliveries: RouteDelivery[] = routesData.map(route => {
        const routeDeliveries = deliveriesData
          .filter(delivery => delivery.route_id === route.id)
          .map(delivery => {
            const location = locationsMap[delivery.location_id];
            return {
              id: delivery.id,
              locationName: location?.name || 'Unknown Location',
              cylinders: delivery.cylinders,
              sequence: delivery.sequence,
              latitude: location?.latitude,
              longitude: location?.longitude
            };
          })
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
      
      const transformedData: DeliveryData[] = [];
      
      routeDeliveries.forEach(route => {
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
            date: formattedDateStr,
            latitude: delivery.latitude,
            longitude: delivery.longitude
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'map' : 'table');
  };

  const mapLocations = filteredDeliveries.map(delivery => ({
    id: delivery.id,
    name: delivery.siteName,
    latitude: delivery.latitude,
    longitude: delivery.longitude,
    address: `${delivery.cylinders} cylinders`
  })).filter(loc => loc.latitude && loc.longitude);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredDeliveries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RouteMetricsCard
            title="Total Cylinders"
            value={totalCylinders}
            icon={<Truck className="h-4 w-4" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            ringColor="ring-orange-400/30"
            tooltip="Total cylinders delivered or picked up on this date"
          />
          
          <RouteMetricsCard
            title="Total Distance"
            value={`${totalKms.toFixed(1)} km`}
            icon={<MapPin className="h-4 w-4" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            ringColor="ring-blue-400/30"
            tooltip="Total distance covered by all deliveries"
          />
          
          <RouteMetricsCard
            title="Delivery Locations"
            value={filteredDeliveries.length}
            icon={<MapPin className="h-4 w-4" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            ringColor="ring-purple-400/30"
            tooltip="Number of delivery locations visited"
          />
          
          <RouteMetricsCard
            title="Fuel Cost"
            value={`R${totalFuelCost.toFixed(2)}`}
            icon={<Fuel className="h-4 w-4" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            ringColor="ring-green-400/30"
            tooltip="Total fuel cost for all deliveries"
          />
        </div>
      )}
      
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
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={toggleViewMode}>
                  <MapPin className="mr-2 h-4 w-4" /> {viewMode === 'table' ? 'View Map' : 'View Table'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1">
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
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Deliveries: {formattedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeliveries.length > 0 ? (
              viewMode === 'table' ? (
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
                <div className="h-[400px]">
                  <RouteMap
                    locations={mapLocations}
                    height="100%"
                    zoom={9}
                  />
                </div>
              )
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
