
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ isLoading, onRouteLegendOpen }) => {
  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading}
        onRouteLegendOpen={onRouteLegendOpen}
      />
    </TabsContent>
  );
};

export default RoutesTab;
