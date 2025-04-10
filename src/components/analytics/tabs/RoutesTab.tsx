
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
  const { fetchRouteData } = useRouteData();
  
  useEffect(() => {
    const verifyRouteData = async () => {
      try {
        const routes = await fetchRouteData();
        if (routes.length === 0) {
          toast.warning("No route data available. Charts may appear empty.", { 
            duration: 5000,
            position: 'top-center'
          });
        }
      } catch (error) {
        console.error("Error verifying route data:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    
    verifyRouteData();
  }, [fetchRouteData]);

  return (
    <TabsContent value="routes" className="space-y-4">
      <RouteEfficiencyChart 
        isLoading={isLoading || localLoading}
        onRouteLegendOpen={onRouteLegendOpen}
      />
    </TabsContent>
  );
};

export default RoutesTab;
