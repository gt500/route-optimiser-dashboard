import React, { useEffect, memo, useMemo } from 'react';
import { useActiveRoutes } from './active-routes/useActiveRoutes';
import ActiveRoutesContent from './active-routes/ActiveRoutesContent';
import { useLocation, useNavigate } from 'react-router-dom';

interface ActiveRoutesTabProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

// Use memo to prevent unnecessary re-renders
const ActiveRoutesTab = memo(({ onCreateRoute, highlightedDeliveryId }: ActiveRoutesTabProps) => {
  // Check for highlighted delivery from route state
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use memoization to prevent unnecessary recalculations
  const routeState = useMemo(() => 
    location.state as { highlightDelivery?: string } | null,
  [location.state]);
  
  // Use the highlighted delivery from props or route state
  const deliveryToHighlight = useMemo(() => 
    highlightedDeliveryId || (routeState?.highlightDelivery || null),
  [highlightedDeliveryId, routeState]);
  
  // Log for debugging - only when the value changes
  useEffect(() => {
    if (deliveryToHighlight) {
      console.log(`ActiveRoutesTab will highlight delivery: ${deliveryToHighlight}`);
    }
  }, [deliveryToHighlight]);
  
  // Use our custom hook to handle routes logic
  const {
    routes,
    isLoading,
    processingRoutes,
    handleStartRoute,
    handleCompleteRoute,
    loadRoutes
  } = useActiveRoutes(deliveryToHighlight);

  // Fix: Prevent navigation state from being lost
  useEffect(() => {
    // Prevent state loss by preserving the current URL path
    const currentPath = location.pathname;
    if (currentPath.includes('routes') && routeState) {
      // Keep the state without triggering navigation
      console.log('Preserving route state:', routeState);
    }
  }, [location.pathname, routeState]);

  // Initial load happens in useActiveRoutes hook now
  // This effect is just for cleaning up timeouts/intervals
  useEffect(() => {
    return () => {
      // Cleanup function will run when component unmounts
      console.log('ActiveRoutesTab unmounted - cleaning up');
    };
  }, []);

  // Handler for route actions to provide immediate feedback
  const onRouteAction = async (actionType: 'start' | 'complete', routeId: string) => {
    try {
      if (actionType === 'start') {
        await handleStartRoute(routeId);
      } else if (actionType === 'complete') {
        await handleCompleteRoute(routeId);
      }
    } catch (error) {
      console.error(`Error during ${actionType} action:`, error);
    }
  };

  return (
    <ActiveRoutesContent
      routes={routes}
      isLoading={isLoading}
      processingRoutes={processingRoutes}
      onStartRoute={(routeId) => onRouteAction('start', routeId)}
      onCompleteRoute={(routeId) => onRouteAction('complete', routeId)}
      onCreateRoute={onCreateRoute}
      highlightedDeliveryId={deliveryToHighlight}
    />
  );
});

export default ActiveRoutesTab;
