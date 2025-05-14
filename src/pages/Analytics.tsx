
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';
import { DownloadIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import MetricsCards from '@/components/analytics/MetricsCards';
import useAnalyticsDetailDialog from '@/hooks/useAnalyticsDetailDialog';
import DetailDialog from '@/components/analytics/DetailDialog';
import RouteLegendDialog from '@/components/analytics/RouteLegendDialog';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the tabs component to improve initial load
const AnalyticsTabs = lazy(() => import('@/components/analytics/AnalyticsTabs'));

const TabsFallback = () => (
  <div className="space-y-4">
    <div className="bg-muted h-10 rounded-md animate-pulse" />
    <div className="space-y-4">
      <div className="bg-muted h-64 rounded-md animate-pulse" />
    </div>
  </div>
);

// Error boundary component to catch errors in tab components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Analytics component error:', error);
    toast({
      title: 'Error Loading Analytics',
      description: 'There was a problem loading this section. Try refreshing the page.',
      variant: 'destructive',
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ErrorFallback = () => (
  <Alert variant="destructive" className="my-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      There was an error loading this content. Please try refreshing the page.
      <Button 
        variant="outline" 
        size="sm" 
        className="ml-2" 
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </AlertDescription>
  </Alert>
);

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
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
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

      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<TabsFallback />}>
          <AnalyticsTabs
            analyticsData={analyticsData}
            timePeriod={timePeriod}
            isLoading={isLoading}
            onRouteLegendOpen={() => setRouteLegendOpen(true)}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default Analytics;
