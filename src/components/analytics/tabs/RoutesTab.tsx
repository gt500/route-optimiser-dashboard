
import React, { useEffect, useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';
import { useRouteData } from '@/hooks/fleet/useRouteData';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

interface RouteDataPoint {
  name: string;
  routeId: string;
  time: number;
  distance: number;
  cost: number;
  cylinders: number;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ isLoading, onRouteLegendOpen }) => {
  const [routeData, setRouteData] = useState<RouteDataPoint[]>([]);
  const routeDataHook = useRouteData();

  useEffect(() => {
    const fetchRouteEfficiencyData = async () => {
      try {
        // Fetch actual route data
        const routes = await routeDataHook.fetchRoutes();
        
        // Format data for chart display with accurate time calculations
        const formattedData = routes.map(route => {
          // Use route's actual distance and duration from predefined data
          const distance = route.total_distance || 0;
          const timeInMinutes = route.total_duration || 0;
          
          return {
            name: route.name,
            routeId: route.id,
            time: timeInMinutes,
            distance: distance,
            cost: route.estimated_cost || 0,
            cylinders: route.total_cylinders || 0
          };
        });
        
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
