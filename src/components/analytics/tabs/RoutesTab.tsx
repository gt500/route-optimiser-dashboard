
import React, { useState, useEffect, memo, useCallback } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';
import { useRouteData } from '@/hooks/fleet/useRouteData';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

// Memoize this component to prevent unnecessary re-renders
const RoutesTab: React.FC<RoutesTabProps> = memo(({ isLoading, onRouteLegendOpen }) => {
  const [routeData, setRouteData] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const routeDataHook = useRouteData();
  const [dataFetched, setDataFetched] = useState(false);

  // Memoize the fetch function to prevent recreating it on each render
  const fetchRouteEfficiencyData = useCallback(async () => {
    if (localLoading) return;
    
    try {
      setLocalLoading(true);
      // Fetch actual route data
      const routes = await routeDataHook.fetchRoutes();
      
      // Take only what we need to prevent memory bloat
      const formattedData = routes.slice(0, 6).map(route => {
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
      
      setRouteData(formattedData);
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching route efficiency data:", error);
      // If there's an error, use empty array
      setRouteData([]);
    } finally {
      setLocalLoading(false);
    }
  }, [routeDataHook, localLoading]);

  useEffect(() => {
    // Only fetch when tab is visible and data hasn't been fetched yet
    if (!isLoading && !dataFetched) {
      fetchRouteEfficiencyData();
    }
  }, [isLoading, dataFetched, fetchRouteEfficiencyData]);

  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading || localLoading}
        onRouteLegendOpen={onRouteLegendOpen}
        routeData={routeData}
      />
    </TabsContent>
  );
});

RoutesTab.displayName = 'RoutesTab';

export default RoutesTab;
