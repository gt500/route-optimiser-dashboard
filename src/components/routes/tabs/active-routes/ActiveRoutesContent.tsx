
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteData } from '@/hooks/fleet/useRouteData';
import RoutesTable from './RoutesTable';
import EmptyRouteState from './EmptyRouteState';
import { toast } from 'sonner';

interface ActiveRoutesContentProps {
  routes: RouteData[];
  isLoading: boolean;
  processingRoutes: Record<string, string>;
  onStartRoute: (routeId: string) => void;
  onCompleteRoute: (routeId: string) => void;
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveRoutesContent = ({
  routes,
  isLoading,
  processingRoutes,
  onStartRoute,
  onCompleteRoute,
  onCreateRoute,
  highlightedDeliveryId
}: ActiveRoutesContentProps) => {
  
  // Show loading state
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

  // Show empty state if no routes
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

  // Show populated routes table
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
          onStartRoute={onStartRoute} 
          onCompleteRoute={onCompleteRoute} 
          highlightedDeliveryId={highlightedDeliveryId}
        />
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesContent;
