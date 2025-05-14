
import React, { useState, useEffect, memo } from 'react';
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
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const routeDataHook = useRouteData();

  useEffect(() => {
    // Use an abort controller to handle component unmount
    const abortController = new AbortController();
    
    const fetchRouteEfficiencyData = async () => {
      try {
        if (abortController.signal.aborted) return;
        
        setLocalLoading(true);
        // Fetch actual route data
        const routes = await routeDataHook.fetchRoutes();
        
        if (abortController.signal.aborted) return;
        
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
      } catch (error) {
        console.error("Error fetching route efficiency data:", error);
        // If there's an error, use empty array
        if (!abortController.signal.aborted) {
          setRouteData([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLocalLoading(false);
        }
      }
    };

    // Only fetch when tab is visible and not already loading
    if (!isLoading) {
      fetchRouteEfficiencyData();
    }
    
    // Clean up function to cancel any in-flight requests when the component unmounts
    return () => {
      abortController.abort();
    };
  }, [isLoading, routeDataHook]);

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
