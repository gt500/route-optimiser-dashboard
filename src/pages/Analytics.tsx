
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';
import { format, subDays } from 'date-fns';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import MetricsCards from '@/components/analytics/MetricsCards';
import DetailDialog from '@/components/analytics/DetailDialog';
import RouteLegendDialog from '@/components/analytics/RouteLegendDialog';
import AnalyticsTabs from '@/components/analytics/AnalyticsTabs';

type DetailType = 'deliveries' | 'fuel' | 'route' | 'cylinders' | null;

const Analytics = () => {
  const { 
    analyticsData, 
    timePeriod, 
    setTimePeriod, 
    isLoading, 
    fetchData 
  } = useAnalyticsData();

  const routeDataHook = useRouteData();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<DetailType>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [routeLegendOpen, setRouteLegendOpen] = useState(false);

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  const deliveriesChange = 12;
  const fuelCostChange = -4;
  const routeLengthChange = -8;
  const cylindersChange = 15;

  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const showCardDetail = async (type: DetailType) => {
    if (!type) return;
    
    setDetailType(type);
    setDetailLoading(true);
    setDetailOpen(true);

    const today = new Date();
    const lastWeek = subDays(today, 7);
    
    try {
      const routes = await routeDataHook.fetchRouteData();
      
      const recentRoutes = routes.filter(route => {
        const routeDate = new Date(route.date);
        return routeDate >= lastWeek && routeDate <= today;
      });

      recentRoutes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const formattedData = recentRoutes.map(route => ({
        id: route.id,
        name: route.name,
        date: format(new Date(route.date), 'MMM d, yyyy'),
        rawDate: new Date(route.date),
        distance: route.total_distance || 0,
        duration: route.total_duration || 0,
        cost: route.estimated_cost || 0,
        cylinders: route.total_cylinders || 0,
        status: route.status
      }));

      setDetailData(formattedData);
      
      switch(type) {
        case 'deliveries':
          setDetailTitle('Recent Deliveries');
          break;
        case 'fuel':
          setDetailTitle('Recent Fuel Costs');
          break;
        case 'route':
          setDetailTitle('Recent Route Lengths');
          break;
        case 'cylinders':
          setDetailTitle('Recent Cylinder Deliveries');
          break;
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Delivery performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timePeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchData()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MetricsCards 
        deliveries={analyticsData.deliveries}
        deliveriesChange={deliveriesChange}
        fuelCost={analyticsData.fuelCost}
        fuelCostChange={fuelCostChange}
        routeLength={analyticsData.routeLength}
        routeLengthChange={routeLengthChange}
        cylinders={analyticsData.cylinders}
        cylindersChange={cylindersChange}
        onCardClick={showCardDetail}
      />

      <DetailDialog 
        open={detailOpen}
        onOpenChange={setDetailOpen}
        detailType={detailType}
        detailTitle={detailTitle}
        detailData={detailData}
        isLoading={detailLoading}
      />

      <RouteLegendDialog 
        open={routeLegendOpen}
        onOpenChange={setRouteLegendOpen}
      />

      <AnalyticsTabs 
        analyticsData={analyticsData}
        timePeriod={timePeriod}
        isLoading={isLoading}
        onRouteLegendOpen={() => setRouteLegendOpen(true)}
      />
    </div>
  );
};

export default Analytics;
