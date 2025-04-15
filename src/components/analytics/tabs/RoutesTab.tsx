
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
        
        // Format data for chart display with realistic time calculations
        const formattedData = routes.map(route => {
          // Ensure realistic time values by calculating based on distance
          // Average speed of 40 km/h = 2/3 km per minute
          // Plus 15 minutes per stop (assuming average of 3 stops)
          const distance = route.total_distance || 0;
          const estimatedStops = 3; // Default assumption if we don't have actual data
          
          // Calculate time: driving time + stop time
          const drivingTimeMinutes = (distance / 40) * 60; // Time in minutes at 40km/h
          const stopTimeMinutes = estimatedStops * 15; // 15 minutes per stop
          const calculatedTime = Math.max(15, Math.round(drivingTimeMinutes + stopTimeMinutes));
          
          // Use calculated time if the existing one is unrealistic
          const timeInMinutes = route.total_duration ? 
            Math.max(calculatedTime, Math.round(route.total_duration / 60)) : 
            calculatedTime;
          
          return {
            name: route.name,
            routeId: route.id,
            time: timeInMinutes, // Convert seconds to minutes or use calculated time
            distance: route.total_distance || 0,
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
