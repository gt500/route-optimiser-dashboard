
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import MetricsCards from '@/components/analytics/MetricsCards';
import useAnalyticsDetailDialog from '@/hooks/useAnalyticsDetailDialog'; // NEW HOOK
import DetailDialog from '@/components/analytics/DetailDialog';
import RouteLegendDialog from '@/components/analytics/RouteLegendDialog';
import AnalyticsTabs from '@/components/analytics/AnalyticsTabs';

const Analytics = () => {
  const { analyticsData, timePeriod, setTimePeriod, isLoading, fetchData } = useAnalyticsData();
  const routeDataHook = useRouteData();
  const {
    detailOpen,
    detailType,
    detailData,
    detailTitle,
    detailLoading,
    setDetailOpen,
    showCardDetail,
    setDetailType,
    setDetailTitle
  } = useAnalyticsDetailDialog({ routeDataHook });

  // Remove dummy summary metric changes, use real data only.
  // If you want change % you must compute it from previous and current, not hardcoded.

  const handlePeriodChange = (value: string) => setTimePeriod(value as TimePeriod);

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
        deliveriesChange={analyticsData.deliveriesChange ?? 0}
        fuelCost={analyticsData.fuelCost}
        fuelCostChange={analyticsData.fuelCostChange ?? 0}
        routeLength={analyticsData.routeLength}
        routeLengthChange={analyticsData.routeLengthChange ?? 0}
        cylinders={analyticsData.cylinders}
        cylindersChange={analyticsData.cylindersChange ?? 0}
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
        open={false}
        onOpenChange={() => {}}
      />

      <AnalyticsTabs
        analyticsData={analyticsData}
        timePeriod={timePeriod}
        isLoading={isLoading}
        onRouteLegendOpen={() => {}}
      />
    </div>
  );
};

export default Analytics;
