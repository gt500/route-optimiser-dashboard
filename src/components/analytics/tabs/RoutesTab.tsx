
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
          // Use route's actual distance or set a default
          const distance = route.total_distance || 0;
          
          // Calculate estimated stops based on cylinders (roughly 1 stop per 5-10 cylinders)
          const estimatedStops = Math.max(3, Math.ceil(route.total_cylinders / 8));
          
          // Calculate accurate time: driving time + stop time
          // For driving time, use standard speeds: 35km/h for urban, 60km/h for highway
          // Average speed calculation based on distance (longer routes likely have more highway portions)
          const avgSpeed = distance < 20 ? 35 : distance < 50 ? 45 : 60; // km/h
          const drivingTimeMinutes = (distance / avgSpeed) * 60; // Time in minutes
          const stopTimeMinutes = estimatedStops * 15; // 15 minutes per stop
          
          // If we have actual duration data, use it with validation
          let timeInMinutes = 0;
          
          if (route.total_duration && route.total_duration > 0) {
            // Convert seconds to minutes
            const durationInMinutes = Math.round(route.total_duration / 60);
            
            // Validate the duration - it should be at least as long as our calculated minimum
            const calculatedMinimum = drivingTimeMinutes + stopTimeMinutes;
            timeInMinutes = Math.max(durationInMinutes, calculatedMinimum);
          } else {
            // Use calculated time if no actual duration data
            timeInMinutes = Math.round(drivingTimeMinutes + stopTimeMinutes);
          }
          
          // Ensure a minimum reasonable time - at least 15 minutes per stop
          timeInMinutes = Math.max(timeInMinutes, estimatedStops * 15);
          
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
