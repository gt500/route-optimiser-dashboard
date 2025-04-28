
import React, { useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RouteStatusBadge from './RouteStatusBadge';
import RouteActionButtons from './RouteActionButtons';
import { RouteData } from '@/hooks/fleet/useRouteData';

interface RoutesTableProps {
  routes: RouteData[];
  processingRoutes: Record<string, string>;
  onStartRoute: (routeId: string) => void;
  onCompleteRoute: (routeId: string) => void;
  highlightedDeliveryId?: string | null;
}

const RoutesTable = ({ 
  routes, 
  processingRoutes, 
  onStartRoute, 
  onCompleteRoute,
  highlightedDeliveryId 
}: RoutesTableProps) => {
  // Ref to scroll to the highlighted row
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);

  // Effect to scroll to the highlighted route
  useEffect(() => {
    if (highlightedDeliveryId && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a brief highlight animation
      highlightedRowRef.current.classList.add('bg-primary/10');
      
      // Remove the highlight after animation
      const timer = setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.classList.remove('bg-primary/10');
        }
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedDeliveryId, routes]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Locations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow 
              key={route.id}
              ref={route.id === highlightedDeliveryId ? highlightedRowRef : null}
              className={`transition-colors duration-300 ${
                route.id === highlightedDeliveryId ? 'bg-primary/10' : ''
              }`}
            >
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>{new Date(route.date).toLocaleDateString()}</TableCell>
              <TableCell>{route.stops?.length || 0} stops</TableCell>
              <TableCell>
                <RouteStatusBadge status={route.status} />
              </TableCell>
              <TableCell>
                {route.vehicle_name || (route.vehicle_id ? `Vehicle ${route.vehicle_id}` : 'None')}
              </TableCell>
              <TableCell className="text-right">
                <RouteActionButtons 
                  routeId={route.id} 
                  status={route.status}
                  processingRoutes={processingRoutes} 
                  onStart={onStartRoute}
                  onComplete={onCompleteRoute}
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
