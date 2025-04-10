
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import ReportTabs from '@/components/reports/ReportTabs';
import DailyCalendarCard from '@/components/reports/DailyCalendarCard';
import DailyDeliveriesTable from '@/components/reports/DailyDeliveriesTable';
import RouteMap from '@/components/routes/RouteMap';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { Truck, MapPin, Fuel } from 'lucide-react';
import { useDeliveryData } from '@/hooks/useDeliveryData';

const DailyReports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  
  const { deliveries, isLoading, fetchDeliveryData } = useDeliveryData(date);
  
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const filteredDeliveries = deliveries.filter(
    delivery => delivery.date === formattedDate
  );

  const totalCylinders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.cylinders, 0);
  const totalKms = filteredDeliveries.reduce((sum, delivery) => sum + delivery.kms, 0);
  const totalFuelCost = filteredDeliveries.reduce((sum, delivery) => sum + delivery.fuelCost, 0);

  const handleRefresh = () => {
    fetchDeliveryData();
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
      <ReportTabs defaultValue="daily" />
      
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
        <DailyCalendarCard 
          date={date}
          setDate={setDate}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onToggleView={toggleViewMode}
          viewMode={viewMode}
          deliveries={filteredDeliveries}
        />

        <Card className="col-span-1 md:col-span-2">
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
