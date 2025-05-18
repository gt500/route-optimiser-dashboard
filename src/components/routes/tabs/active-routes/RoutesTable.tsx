
import React, { useEffect, useRef, memo, useMemo } from 'react';
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

// Use memo with custom equality function to prevent unnecessary re-renders
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
  // Ref for animation timeouts to clean them up
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Get highlighted route ID with memoization
  const highlightedRouteId = useMemo(() => {
    if (!highlightedDeliveryId) return null;
    
    // Find the route containing this delivery
    for (const route of routes) {
      if (route.id === highlightedDeliveryId) return route.id;
      if (route.stops?.some(stop => stop.id === highlightedDeliveryId)) return route.id;
    }
    return null;
  }, [routes, highlightedDeliveryId]);

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
          
          animationTimeoutsRef.current.push(cleanupTimer);
        }
      }, 300);
      
      animationTimeoutsRef.current.push(timerId);
    }
    
    // Cleanup all animation timeouts on unmount
    return () => {
      animationTimeoutsRef.current.forEach(clearTimeout);
      animationTimeoutsRef.current = [];
    };
  }, [highlightedDeliveryId]);

  // Memoize the route items to prevent unnecessary re-renders
  const routeItems = useMemo(() => {
    return routes.map((route) => (
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
            onStart={onStartRoute}
            onComplete={onCompleteRoute}
          />
        </TableCell>
      </TableRow>
    ));
  }, [routes, highlightedRouteId, processingRoutes, onStartRoute, onCompleteRoute]);

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
          {routeItems}
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
}, (prevProps, nextProps) => {
  // Custom equality check to prevent unnecessary re-renders
  if (prevProps.routes.length !== nextProps.routes.length) return false;
  if (prevProps.highlightedDeliveryId !== nextProps.highlightedDeliveryId) return false;
  
  // Compare route IDs for equality
  const prevIds = new Set(prevProps.routes.map(r => r.id));
  const nextIds = new Set(nextProps.routes.map(r => r.id));
  if (prevIds.size !== nextIds.size) return false;
  
  // Check if any routes have been added or removed
  for (const id of prevIds) {
    if (!nextIds.has(id)) return false;
  }
  
  // Check if any processing states have changed
  const prevProcessingKeys = Object.keys(prevProps.processingRoutes);
  const nextProcessingKeys = Object.keys(nextProps.processingRoutes);
  if (prevProcessingKeys.length !== nextProcessingKeys.length) return false;
  
  for (const key of prevProcessingKeys) {
    if (prevProps.processingRoutes[key] !== nextProps.processingRoutes[key]) return false;
  }
  
  // Routes collection and processing state are the same
  return true;
});

export default RoutesTable;
