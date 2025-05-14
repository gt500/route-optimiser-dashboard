
import React, { Suspense, lazy, useState } from 'react';
import { useAnalyticsData } from '@/hooks/analytics';
import { TimePeriod } from '@/hooks/analyticsTypes';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import MetricsCards from '@/components/analytics/MetricsCards';
import useAnalyticsDetailDialog from '@/hooks/useAnalyticsDetailDialog';
import DetailDialog from '@/components/analytics/DetailDialog';
import RouteLegendDialog from '@/components/analytics/RouteLegendDialog';
import { toast } from '@/components/ui/use-toast';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsErrorBoundary, { ErrorFallback } from '@/components/analytics/AnalyticsErrorBoundary';
import { MetricsCardsSkeleton, TabsFallback } from '@/components/analytics/LoadingPlaceholders';

// Lazy load the tabs component to improve initial load
const AnalyticsTabs = lazy(() => import('@/components/analytics/AnalyticsTabs'));

const Analytics = () => {
  const { analyticsData, timePeriod, setTimePeriod, isLoading, fetchData } = useAnalyticsData();
  const routeDataHook = useRouteData();
  const [routeLegendOpen, setRouteLegendOpen] = useState(false);
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

  const handlePeriodChange = (value: string) => {
    try {
      setTimePeriod(value as TimePeriod);
    } catch (error) {
      console.error('Error changing period:', error);
      toast({
        title: 'Error',
        description: 'Failed to update time period',
        variant: 'destructive',
      });
    }
  };

  const handleRefreshData = () => {
    try {
      fetchData();
      toast({
        title: 'Refreshing Data',
        description: 'Analytics data is being updated',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AnalyticsHeader 
        timePeriod={timePeriod} 
        isLoading={isLoading}
        onPeriodChange={handlePeriodChange}
        onRefreshData={handleRefreshData}
      />

      {isLoading ? (
        <MetricsCardsSkeleton />
      ) : (
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
      )}

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

      <AnalyticsErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<TabsFallback />}>
          <AnalyticsTabs
            analyticsData={analyticsData}
            timePeriod={timePeriod}
            isLoading={isLoading}
            onRouteLegendOpen={() => setRouteLegendOpen(true)}
          />
        </Suspense>
      </AnalyticsErrorBoundary>
    </div>
  );
};

export default Analytics;
