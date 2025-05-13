
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

  // Debug to help troubleshoot
  console.log("RoutesTable rendering with routes:", routes);
  console.log("Processing routes:", processingRoutes);
  console.log("Highlighted delivery ID:", highlightedDeliveryId);

  // Effect to scroll to the highlighted route
  useEffect(() => {
    if (highlightedDeliveryId && highlightedRowRef.current) {
      console.log(`Scrolling to highlighted route: ${highlightedDeliveryId}`);
      
      // Add a brief delay to ensure the DOM is fully rendered
      setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add a brief highlight animation
          highlightedRowRef.current.classList.add('bg-primary/20');
          highlightedRowRef.current.classList.add('pulse-highlight');
          
          // Remove the highlight after animation
          const timer = setTimeout(() => {
            if (highlightedRowRef.current) {
              highlightedRowRef.current.classList.remove('bg-primary/20');
              highlightedRowRef.current.classList.remove('pulse-highlight');
            }
          }, 3000);
          
          return () => clearTimeout(timer);
        }
      }, 300);
    }
  }, [highlightedDeliveryId, routes]);

  return (
    <div className="overflow-x-auto">
      <style>
        {`
        .pulse-highlight {
          animation: highlight-pulse 2s ease-in-out;
        }
        
        @keyframes highlight-pulse {
          0% { background-color: rgba(var(--primary), 0.3); }
          50% { background-color: rgba(var(--primary), 0.1); }
          100% { background-color: transparent; }
        }
        `}
      </style>
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
                {/* Always show Leyland Ashok Phoenix regardless of what's in the data */}
                Leyland Ashok Phoenix
              </TableCell>
              <TableCell className="text-right">
                <RouteActionButtons 
                  routeId={route.id} 
                  status={route.status}
                  processingRoutes={processingRoutes} 
                  onStart={(id) => {
                    console.log("Start route clicked in RoutesTable for:", id);
                    onStartRoute(id);
                  }}
                  onComplete={(id) => {
                    console.log("Complete route clicked in RoutesTable for:", id);
                    onCompleteRoute(id);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
          {routes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                No active routes found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoutesTable;
