
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import CostsTab from './tabs/CostsTab';
import RoutesTab from './tabs/RoutesTab';
import { AnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';

interface AnalyticsTabsProps {
  analyticsData: AnalyticsData;
  timePeriod: TimePeriod;
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  analyticsData,
  timePeriod,
  isLoading,
  onRouteLegendOpen
}) => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        <TabsTrigger value="routes">Route Performance</TabsTrigger>
      </TabsList>
      
      <OverviewTab 
        analyticsData={analyticsData}
        timePeriod={timePeriod}
        isLoading={isLoading}
      />
      
      <CostsTab 
        analyticsData={analyticsData}
        isLoading={isLoading}
      />
      
      <RoutesTab 
        isLoading={isLoading}
        onRouteLegendOpen={onRouteLegendOpen}
      />
    </Tabs>
  );
};

export default AnalyticsTabs;
