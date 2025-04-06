
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TruckIcon, CalendarIcon, MapPinIcon, ExternalLinkIcon } from 'lucide-react';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { Badge } from '@/components/ui/badge';

const ActiveRoutesTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchActiveRoutes } = useRouteData();

  useEffect(() => {
    const loadRoutes = async () => {
      setIsLoading(true);
      const activeRoutes = await fetchActiveRoutes();
      setRoutes(activeRoutes);
      setIsLoading(false);
    };

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
    if (status === 'scheduled') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Scheduled</Badge>;
    } else if (status === 'in_progress') {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">In Progress</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
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
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="rounded-full bg-secondary p-4">
              <TruckIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No active routes</h3>
            <p className="text-muted-foreground max-w-md">
              No routes are currently in progress. Create a new route and dispatch it to see it here.
            </p>
            <Button variant="outline" className="mt-2" onClick={onCreateRoute}>
              Create Route
            </Button>
          </div>
        </CardContent>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cylinders</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.name || `Route ${formatDate(route.date)}`}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {formatDate(route.date)}
                  </div>
                </TableCell>
                <TableCell>{route.total_cylinders}</TableCell>
                <TableCell>{route.total_distance?.toFixed(1)} km</TableCell>
                <TableCell>{getStatusBadge(route.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLinkIcon className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
