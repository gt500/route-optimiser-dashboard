
import React, { useEffect, useRef, memo } from 'react';
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

// Use memo to prevent unnecessary re-renders
const RoutesTable = memo(({ 
  routes, 
  processingRoutes, 
  onStartRoute, 
  onCompleteRoute,
  highlightedDeliveryId 
}: RoutesTableProps) => {
  // Ref to scroll to the highlighted row
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  // Ref to track if we've already scrolled to this highlight
  const hasScrolledRef = useRef<string | null>(null);

  // Only log on initial render or when props change
  useEffect(() => {
    console.log("RoutesTable rendering with routes:", routes.length);
    console.log("Processing routes:", Object.keys(processingRoutes).length);
    console.log("Highlighted delivery ID:", highlightedDeliveryId);
  }, [routes.length, Object.keys(processingRoutes).length, highlightedDeliveryId]);

  // Effect to scroll to the highlighted route - only run when ID changes
  useEffect(() => {
    // Only scroll if we have a new highlighted ID that we haven't scrolled to yet
    if (highlightedDeliveryId && 
        highlightedRowRef.current && 
        hasScrolledRef.current !== highlightedDeliveryId) {
      console.log(`Scrolling to highlighted route: ${highlightedDeliveryId}`);
      
      // Track that we've scrolled to this ID
      hasScrolledRef.current = highlightedDeliveryId;
      
      // Add a brief delay to ensure the DOM is fully rendered
      const timerId = setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add a brief highlight animation
          highlightedRowRef.current.classList.add('bg-primary/20');
          highlightedRowRef.current.classList.add('pulse-highlight');
          
          // Remove the highlight after animation
          const cleanupTimer = setTimeout(() => {
            if (highlightedRowRef.current) {
              highlightedRowRef.current.classList.remove('bg-primary/20');
              highlightedRowRef.current.classList.remove('pulse-highlight');
            }
          }, 3000);
          
          return () => clearTimeout(cleanupTimer);
        }
      }, 300);
      
      return () => clearTimeout(timerId);
    }
  }, [highlightedDeliveryId]);

  const getHighlightRoute = () => {
    if (!highlightedDeliveryId) return null;
    
    // Find the route containing this delivery
    for (const route of routes) {
      if (route.id === highlightedDeliveryId) return route.id;
      if (route.stops?.some(stop => stop.id === highlightedDeliveryId)) return route.id;
    }
    return null;
  };

  // Find the route to highlight
  const highlightedRouteId = getHighlightRoute();

  return (
    <div className="overflow-x-auto">
      <style>
        {`
        .pulse-highlight {
          animation: highlight-pulse 2s ease-in-out;
        }
        
        @keyframes highlight-pulse {
          0% { background-color: rgba(59, 130, 246, 0.3); }
          50% { background-color: rgba(59, 130, 246, 0.1); }
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
              ref={route.id === highlightedRouteId ? highlightedRowRef : null}
              className={`transition-colors duration-300 ${
                route.id === highlightedRouteId ? 'bg-primary/10' : ''
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
});

export default RoutesTable;
