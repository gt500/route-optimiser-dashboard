
import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import RouteEfficiencyChart from '../charts/RouteEfficiencyChart';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';

interface RoutesTabProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ isLoading, onRouteLegendOpen }) => {
  const [localLoading, setLocalLoading] = useState(true);
  const [routeData, setRouteData] = useState<any[]>([]);
  const { fetchRouteData } = useRouteData();
  
  useEffect(() => {
    const loadRouteData = async () => {
      try {
        console.log('RoutesTab - Fetching route data');
        const routes = await fetchRouteData();
        
        if (routes.length === 0) {
          toast.warning("No route data available. Charts may appear empty.", { 
            duration: 5000,
            position: 'top-center'
          });
        } else {
          console.log(`RoutesTab - Loaded ${routes.length} routes successfully`);
          setRouteData(routes);
        }
      } catch (error) {
        console.error("Error loading route data:", error);
        toast.error("Failed to load route data");
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadRouteData();
  }, [fetchRouteData]);

  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading || localLoading}
        onRouteLegendOpen={onRouteLegendOpen}
        routeData={routeData}
      />
    </TabsContent>
  );
};

export default RoutesTab;
