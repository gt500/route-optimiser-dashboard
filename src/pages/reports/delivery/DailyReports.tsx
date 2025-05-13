import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import ReportTabs from '@/components/reports/ReportTabs';
import DailyCalendarCard from '@/components/reports/DailyCalendarCard';
import DailyDeliveriesTable from '@/components/reports/DailyDeliveriesTable';
import RouteMap from '@/components/routes/RouteMap';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { Truck, MapPin, Fuel } from 'lucide-react';
import { useDeliveryData } from '@/hooks/delivery/useDeliveryData';
import { toast } from 'sonner';

const DailyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [trafficCondition, setTrafficCondition] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  
  const { deliveries, isLoading, fetchDeliveryData } = useDeliveryData(date);
  
  // Ensure the data is fetched on component mount and when date changes
  useEffect(() => {
    if (date) {
      console.log("Initializing daily reports with date:", format(date, 'yyyy-MM-dd'));
      fetchDeliveryData();
    }
  }, [date, fetchDeliveryData]);
  
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const filteredDeliveries = deliveries.filter(
    delivery => delivery.date === formattedDate
  );

  const totalCylinders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
  const totalKms = routeDistance > 0 ? routeDistance : 
                  filteredDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
  const totalFuelCost = filteredDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);

  const handleRefresh = () => {
    if (date) {
      console.log("Manually refreshing daily data for:", format(date, 'yyyy-MM-dd'));
      toast.info(`Refreshing data for ${format(date, 'MMM dd, yyyy')}`);
      fetchDeliveryData();
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'map' : 'table');
  };

  const mapLocations = filteredDeliveries
    .map(delivery => ({
      id: delivery.id,
      name: delivery.siteName,
      latitude: delivery.latitude || 0,
      longitude: delivery.longitude || 0,
      address: `${delivery.cylinders} cylinders`
    }))
    .filter(loc => loc.latitude && loc.longitude);
    
  const handleRouteDataUpdate = (
    distance: number, 
    duration: number, 
    traffic?: 'light' | 'moderate' | 'heavy'
  ) => {
    console.log("Route data updated in DailyReports:", { distance, duration, traffic });
    setRouteDistance(distance);
    setRouteDuration(duration);
    if (traffic) setTrafficCondition(traffic);
  };

  return (
    <div className="space-y-4">
      <ReportTabs defaultValue="daily" />
      
      {filteredDeliveries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RouteMetricsCard
            title="Total Cylinders"
            value={totalCylinders}
            icon={<Truck className="h-4 w-4" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            tooltip="Total cylinders delivered or picked up on this date"
          />
          
          <RouteMetricsCard
            title="Total Distance"
            value={`${totalKms.toFixed(1)} km`}
            icon={<MapPin className="h-4 w-4" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            tooltip="Total distance covered by all deliveries"
          />
          
          <RouteMetricsCard
            title="Number of Deliveries"
            value={filteredDeliveries.length}
            icon={<MapPin className="h-4 w-4" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            tooltip="Number of delivery locations visited"
          />
          
          <RouteMetricsCard
            title="Fuel Cost"
            value={`R${totalFuelCost.toFixed(2)}`}
            icon={<Fuel className="h-4 w-4" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            tooltip="Total fuel cost for all deliveries"
          />
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <DailyCalendarCard 
            date={date}
            setDate={setDate}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onToggleView={toggleViewMode}
            viewMode={viewMode}
            deliveries={filteredDeliveries}
          />
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Daily Deliveries: {formattedDate}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDeliveries.length > 0 ? (
                viewMode === 'table' ? (
                  <DailyDeliveriesTable 
                    deliveries={filteredDeliveries}
                    totalCylinders={totalCylinders}
                    totalKms={totalKms}
                    totalFuelCost={totalFuelCost}
                  />
                ) : (
                  <div className="h-[400px]">
                    <RouteMap
                      locations={mapLocations}
                      routeCoordinates={[]} // Provide empty array as default
                      startLocation={null} // Set as null by default
                      endLocation={null} // Set as null by default
                      className="h-full w-full" // Use className instead of height
                      showTraffic={true}
                      showRoadRoutes={true}
                      country="South Africa"
                      region="Western Cape"
                      onRouteDataUpdate={handleRouteDataUpdate}
                    />
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    {isLoading 
                      ? "Loading delivery data..." 
                      : "No deliveries found for this date. Try selecting a different date or refreshing the data."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyReports;
