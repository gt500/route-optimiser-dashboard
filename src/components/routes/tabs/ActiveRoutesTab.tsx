
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmptyRouteState from './active-routes/EmptyRouteState';
import RoutesTable from './active-routes/RoutesTable';

const ActiveRoutesTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});
  const { fetchActiveRoutes } = useRouteData();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setIsLoading(true);
    const activeRoutes = await fetchActiveRoutes();
    setRoutes(activeRoutes);
    setIsLoading(false);
  };

  const startRoute = async (routeId: string) => {
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
      
      const { error } = await supabase
        .from('routes')
        .update({ status: 'in_progress' })
        .eq('id', routeId)
        .eq('status', 'scheduled'); // Only update if currently scheduled
      
      if (error) {
        throw error;
      }
      
      toast.success('Route started');
      await loadRoutes(); // Reload the routes to update the UI
    } catch (error) {
      console.error('Error starting route:', error);
      toast.error('Failed to start route');
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  };

  const markRouteAsComplete = async (routeId: string) => {
    try {
      setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
      
      // Log statement to debug update operation
      console.log(`Marking route ${routeId} as completed`);
      
      const { error } = await supabase
        .from('routes')
        .update({ status: 'completed' })
        .eq('id', routeId);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast.success('Route marked as completed');
      
      // Force reload the routes to refresh the UI with the updated status
      await loadRoutes();
    } catch (error) {
      console.error('Error completing route:', error);
      toast.error('Failed to complete route');
    } finally {
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>Loading active routes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Routes</CardTitle>
          <CardDescription>
            Currently active delivery routes
          </CardDescription>
        </CardHeader>
        <EmptyRouteState onCreateRoute={onCreateRoute} />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Routes</CardTitle>
        <CardDescription>Currently active delivery routes</CardDescription>
      </CardHeader>
      <CardContent>
        <RoutesTable 
          routes={routes} 
          processingRoutes={processingRoutes} 
          onStartRoute={startRoute} 
          onCompleteRoute={markRouteAsComplete} 
        />
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
