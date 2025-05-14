
import React, { Suspense, lazy } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { AnalyticsData, TimePeriod } from '@/hooks/analyticsTypes';

// Lazy load the tab contents to improve initial load performance
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const CostsTab = lazy(() => import('./tabs/CostsTab'));
const RoutesTab = lazy(() => import('./tabs/RoutesTab'));

interface AnalyticsTabsProps {
  analyticsData: AnalyticsData;
  timePeriod: TimePeriod;
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const TabFallback = () => (
  <div className="h-60 w-full flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  analyticsData,
  timePeriod,
  isLoading,
  onRouteLegendOpen
}) => {
  // Using state to track the active tab to help with debugging if needed
  const [activeTab, setActiveTab] = React.useState('overview');

  const handleTabChange = (value: string) => {
    console.log(`Switching to tab: ${value}`);
    setActiveTab(value);
  };

  return (
    <Tabs 
      defaultValue="overview" 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        <TabsTrigger value="routes">Route Performance</TabsTrigger>
      </TabsList>
      
      <Suspense fallback={<TabFallback />}>
        <TabsContent value="overview">
          <OverviewTab 
            analyticsData={analyticsData}
            timePeriod={timePeriod}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="costs">
          <CostsTab 
            analyticsData={analyticsData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="routes">
          <RoutesTab 
            isLoading={isLoading}
            onRouteLegendOpen={onRouteLegendOpen}
          />
        </TabsContent>
      </Suspense>
    </Tabs>
  );
};

export default AnalyticsTabs;
