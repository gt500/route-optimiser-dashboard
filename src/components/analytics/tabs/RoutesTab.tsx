
import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';
import { useRouteData } from '@/hooks/fleet/useRouteData';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ isLoading, onRouteLegendOpen }) => {
  const [routeData, setRouteData] = useState<any[]>([]);
  const routeDataHook = useRouteData();

  useEffect(() => {
    const fetchRouteEfficiencyData = async () => {
      try {
        // Fetch actual route data
        const routes = await routeDataHook.fetchRouteData();
        
        // Format data for chart display
        const formattedData = routes.map(route => ({
          name: route.name,
          routeId: route.id,
          time: Math.round((route.total_duration || 0) / 60), // Convert seconds to minutes
          distance: route.total_distance || 0,
          cost: route.estimated_cost || 0,
          cylinders: route.total_cylinders || 0
        }));
        
        // Take the most recent 6 routes or all if less than 6
        const recentRoutes = formattedData.slice(0, 6);
        setRouteData(recentRoutes);
      } catch (error) {
        console.error("Error fetching route efficiency data:", error);
        // If there's an error, use empty array
        setRouteData([]);
      }
    };

    if (!isLoading) {
      fetchRouteEfficiencyData();
    }
  }, [isLoading]);

  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading}
        onRouteLegendOpen={onRouteLegendOpen}
        routeData={routeData}
      />
    </TabsContent>
  );
};

export default RoutesTab;
