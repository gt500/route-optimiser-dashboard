
import React, { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CostBreakdownChart from '../charts/CostBreakdownChart';
import { AnalyticsData } from '@/hooks/analyticsTypes';

interface CostsTabProps {
  analyticsData: AnalyticsData;
  isLoading: boolean;
}

// Memoize this component to prevent unnecessary re-renders
const CostsTab: React.FC<CostsTabProps> = memo(({ analyticsData, isLoading }) => {
  // Use lightweight computation here to avoid freezing the UI
  const costData = React.useMemo(() => analyticsData.costBreakdown, [analyticsData.costBreakdown]);

  return (
    <TabsContent value="costs" className="space-y-4">
      <CostBreakdownChart 
        costBreakdown={costData}
        isLoading={isLoading}
      />
    </TabsContent>
  );
});

CostsTab.displayName = 'CostsTab';

export default CostsTab;
