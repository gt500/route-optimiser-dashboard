
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import CostBreakdownChart from '../charts/CostBreakdownChart';
import { AnalyticsData } from '@/hooks/useAnalyticsData';

interface CostsTabProps {
  analyticsData: AnalyticsData;
  isLoading: boolean;
}

const CostsTab: React.FC<CostsTabProps> = ({ analyticsData, isLoading }) => {
  return (
    <TabsContent value="costs" className="space-y-4">
      <CostBreakdownChart 
        costBreakdown={analyticsData.costBreakdown}
        isLoading={isLoading}
      />
    </TabsContent>
  );
};

export default CostsTab;
