
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import OverviewCharts from '../charts/OverviewCharts';
import { AnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';

interface OverviewTabProps {
  analyticsData: AnalyticsData;
  timePeriod: TimePeriod;
  isLoading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ analyticsData, timePeriod, isLoading }) => {
  return (
    <TabsContent value="overview" className="space-y-4">
      <OverviewCharts 
        monthlyDeliveries={analyticsData.monthlyDeliveries}
        fuelConsumption={analyticsData.fuelConsumption}
        routeDistribution={analyticsData.routeDistribution}
        timePeriod={timePeriod}
        isLoading={isLoading}
      />
    </TabsContent>
  );
};

export default OverviewTab;
