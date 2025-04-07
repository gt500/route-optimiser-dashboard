
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon } from 'lucide-react';
import { RouteData } from '@/hooks/fleet/useRouteData';
import RouteStatusBadge from './RouteStatusBadge';
import RouteActionButtons from './RouteActionButtons';

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
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Route Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Cylinders</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes.map((route) => (
          <TableRow key={route.id + route.status}>
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
            <TableCell><RouteStatusBadge status={route.status} /></TableCell>
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
  );
};

export default RoutesTable;
