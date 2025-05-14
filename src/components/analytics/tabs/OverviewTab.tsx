
import React, { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import OverviewCharts from '../charts/OverviewCharts';
import { AnalyticsData, TimePeriod } from '@/hooks/analyticsTypes';

interface OverviewTabProps {
  analyticsData: AnalyticsData;
  timePeriod: TimePeriod;
  isLoading: boolean;
}

// Memoize this component to prevent unnecessary re-renders
const OverviewTab: React.FC<OverviewTabProps> = memo(({ analyticsData, timePeriod, isLoading }) => {
  // Use light computation here to avoid freezing the UI
  const chartData = React.useMemo(() => ({
    monthlyDeliveries: analyticsData.monthlyDeliveries,
    fuelConsumption: analyticsData.fuelConsumption,
    routeDistribution: analyticsData.routeDistribution
  }), [
    analyticsData.monthlyDeliveries,
    analyticsData.fuelConsumption,
    analyticsData.routeDistribution
  ]);

  return (
    <TabsContent value="overview" className="space-y-4">
      <OverviewCharts 
        monthlyDeliveries={chartData.monthlyDeliveries}
        fuelConsumption={chartData.fuelConsumption}
        routeDistribution={chartData.routeDistribution}
        timePeriod={timePeriod}
        isLoading={isLoading}
      />
    </TabsContent>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
