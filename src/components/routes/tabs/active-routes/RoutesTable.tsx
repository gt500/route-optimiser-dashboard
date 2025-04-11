
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { RouteData } from '@/hooks/fleet/useRouteData';
import RouteStatusBadge from './RouteStatusBadge';
import RouteActionButtons from './RouteActionButtons';
import RouteActions from '@/components/routes/RouteActions';

interface RoutesTableProps {
  routes: RouteData[];
  processingRoutes: Record<string, string>;
  onStartRoute: (routeId: string) => void;
  onCompleteRoute: (routeId: string) => void;
}

const RoutesTable = ({
  routes,
  processingRoutes,
  onStartRoute,
  onCompleteRoute
}: RoutesTableProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getSelectedRouteData = () => {
    if (!selectedRouteId) return null;
    
    const selectedRoute = routes.find(route => route.id === selectedRouteId);
    if (!selectedRoute) return null;
    
    // Transform the route data into the format expected by RouteActions
    return {
      name: selectedRoute.name || `Route ${formatDate(selectedRoute.date)}`,
      stops: (selectedRoute.stops || []).map(stop => ({
        siteName: stop.location_name || 'Unknown',
        cylinders: stop.cylinders || 0,
        kms: stop.distance || 0,
        fuelCost: stop.fuel_cost || 0
      })) || []
    };
  };

  const selectedRouteData = getSelectedRouteData();

  return (
    <div>
      {selectedRouteData && (
        <div className="flex justify-end mb-4">
          <RouteActions 
            routeData={selectedRouteData}
            disabled={false}
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Route Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stops</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell className="font-medium">
                {route.name || `Route ${formatDate(route.date)}`}
              </TableCell>
              <TableCell>{formatDate(route.date)}</TableCell>
              <TableCell>
                <RouteStatusBadge status={route.status} />
              </TableCell>
              <TableCell>{(route.stops || []).length}</TableCell>
              <TableCell>{route.total_distance?.toFixed(1)} km</TableCell>
              <TableCell>{route.total_cylinders}</TableCell>
              <TableCell>{route.vehicle_name || 'Not assigned'}</TableCell>
              <TableCell className="text-right">
                <RouteActionButtons
                  routeId={route.id}
                  status={route.status}
                  processingRoutes={processingRoutes}
                  onStartRoute={onStartRoute}
                  onCompleteRoute={onCompleteRoute}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoutesTable;
