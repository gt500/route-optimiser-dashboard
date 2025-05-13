
import React, { useEffect } from 'react';
import { useActiveRoutes } from './active-routes/useActiveRoutes';
import ActiveRoutesContent from './active-routes/ActiveRoutesContent';
import { useLocation } from 'react-router-dom';

interface ActiveRoutesTabProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveRoutesTab = ({ onCreateRoute, highlightedDeliveryId }: ActiveRoutesTabProps) => {
  // Check for highlighted delivery from route state
  const location = useLocation();
  const routeState = location.state as { highlightDelivery?: string } | null;
  
  // Use the highlighted delivery from props or route state
  const deliveryToHighlight = highlightedDeliveryId || (routeState?.highlightDelivery || null);
  
  // Log for debugging
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
    handleCompleteRoute
  } = useActiveRoutes(deliveryToHighlight);

  return (
    <ActiveRoutesContent
      routes={routes}
      isLoading={isLoading}
      processingRoutes={processingRoutes}
      onStartRoute={handleStartRoute}
      onCompleteRoute={handleCompleteRoute}
      onCreateRoute={onCreateRoute}
      highlightedDeliveryId={deliveryToHighlight}
    />
  );
};

export default ActiveRoutesTab;
