import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { Badge } from '@/components/ui/badge';
import RouteActions from '@/components/routes/RouteActions';

const RouteHistoryTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const { fetchRouteHistory } = useRouteData();

  const loadRoutes = async () => {
    setIsLoading(true);
    const historyRoutes = await fetchRouteHistory();
    setRoutes(historyRoutes);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
    } else if (status === 'cancelled') {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'cancelled') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getSelectedRouteData = () => {
    if (!selectedRouteId) return null;
    
    const selectedRoute = routes.find(route => route.id === selectedRouteId);
    if (!selectedRoute) return null;
    
    return {
      name: selectedRoute.name || `Route ${formatDate(selectedRoute.date)}`,
      stops: (selectedRoute.stops || []).map(stop => ({
        siteName: stop.location_name || 'Unknown',
        cylinders: stop.cylinders || 0,
        kms: stop.distance || 0,
        fuelCost: stop.fuel_cost || 0
      }))
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route History</CardTitle>
          <CardDescription>Loading route history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route History</CardTitle>
          <CardDescription>
            Previously completed routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="rounded-full bg-secondary p-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No route history</h3>
            <p className="text-muted-foreground max-w-md">
              Your completed routes will appear here after you mark them as completed from the Active Routes tab.
            </p>
            <Button variant="outline" className="mt-2" onClick={onCreateRoute}>
              Create Route
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRouteData = getSelectedRouteData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Route History</CardTitle>
          <CardDescription>Previously completed routes</CardDescription>
        </div>
        {selectedRouteData && (
          <RouteActions 
            routeData={selectedRouteData}
            disabled={false}
          />
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Route Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cylinders</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow 
                key={route.id} 
                className={selectedRouteId === route.id ? "bg-blue-50" : ""}
                onClick={() => setSelectedRouteId(route.id === selectedRouteId ? null : route.id)}
              >
                <TableCell>
                  <input 
                    type="radio" 
                    checked={selectedRouteId === route.id}
                    onChange={() => {}}
                    className="rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium">{route.name || `Route ${formatDate(route.date)}`}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {formatDate(route.date)}
                  </div>
                </TableCell>
                <TableCell>{route.total_cylinders}</TableCell>
                <TableCell>{route.total_distance?.toFixed(1)} km</TableCell>
                <TableCell>R {route.estimated_cost?.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(route.status)}
                    {getStatusBadge(route.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RouteHistoryTab;
