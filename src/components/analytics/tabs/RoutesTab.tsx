
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ isLoading, onRouteLegendOpen }) => {
  // Use dummy data for now since we're reverting to that approach
  const dummyRouteData = [
    { name: 'Cape Town CBD', routeId: 'Route 1', time: 45, distance: 12.5, cost: 210, cylinders: 25 },
    { name: 'Gas Depot - Southern Suburbs', routeId: 'Route 2', time: 60, distance: 18.3, cost: 280, cylinders: 32 },
    { name: 'Northern Distribution Line', routeId: 'Route 3', time: 75, distance: 24.7, cost: 350, cylinders: 18 },
    { name: 'Atlantic Seaboard', routeId: 'Route 4', time: 50, distance: 15.6, cost: 240, cylinders: 22 },
    { name: 'Stellenbosch Distribution', routeId: 'Route 5', time: 90, distance: 28.2, cost: 420, cylinders: 28 },
    { name: 'West Coast', routeId: 'Route 6', time: 65, distance: 22.4, cost: 310, cylinders: 15 },
  ];

  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading}
        onRouteLegendOpen={onRouteLegendOpen}
        routeData={dummyRouteData}
      />
    </TabsContent>
  );
};

export default RoutesTab;
