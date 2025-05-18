
import React, { useEffect, memo, useMemo } from 'react';
import ActiveRoutesTab from '../ActiveRoutesTab';
import { useLocation, useNavigate } from 'react-router-dom';

interface ActiveTabContentProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

// Use memo to prevent unnecessary re-renders
const ActiveTabContent: React.FC<ActiveTabContentProps> = memo(({ 
  onCreateRoute,
  highlightedDeliveryId 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use memoization to prevent unnecessary recalculations
  const routeState = useMemo(() => 
    location.state as { highlightDelivery?: string } | null,
  [location.state]);
  
  // Use memoization for deliveryToHighlight to prevent unnecessary re-renders
  const deliveryToHighlight = useMemo(() => 
    highlightedDeliveryId || (routeState?.highlightDelivery || null),
  [highlightedDeliveryId, routeState]);
  
  // Ensure we're on the routes page, but only check once
  useEffect(() => {
    if (!location.pathname.includes('/routes')) {
      console.log('Redirecting to routes page from ActiveTabContent');
      navigate('/routes', { replace: true, state: location.state });
    }
  }, [location.pathname, navigate, location.state]);

  return (
    <ActiveRoutesTab 
      onCreateRoute={onCreateRoute} 
      highlightedDeliveryId={deliveryToHighlight}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo to prevent unnecessary re-renders
  return prevProps.highlightedDeliveryId === nextProps.highlightedDeliveryId;
});

export default ActiveTabContent;
