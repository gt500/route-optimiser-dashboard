
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
  
  // Only redirect if we're not on the routes page and not coming from a region selection
  useEffect(() => {
    // Set flag to indicate we're trying to access routes
    if (!location.pathname.includes('/routes')) {
      console.log('Setting attempting_routes flag');
      sessionStorage.setItem('attempting_routes', 'true');
      
      console.log('Redirecting to routes page from ActiveTabContent');
      navigate('/routes', { replace: true, state: location.state });
    }
    
    // Clean up the flag if it exists and we're on the routes page
    if (location.pathname.includes('/routes') && sessionStorage.getItem('from_region_selection')) {
      sessionStorage.removeItem('from_region_selection');
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
