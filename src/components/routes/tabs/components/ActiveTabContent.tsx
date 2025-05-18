
import React, { useEffect, memo, useMemo } from 'react';
import ActiveRoutesTab from '../ActiveRoutesTab';
import { useLocation } from 'react-router-dom';

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
  
  // Use memoization to prevent unnecessary recalculations
  const routeState = useMemo(() => 
    location.state as { highlightDelivery?: string } | null,
  [location.state]);
  
  // Use memoization for deliveryToHighlight to prevent unnecessary re-renders
  const deliveryToHighlight = useMemo(() => 
    highlightedDeliveryId || (routeState?.highlightDelivery || null),
  [highlightedDeliveryId, routeState]);
  
  // Log when active routes component mounts or updates - only when values change
  useEffect(() => {
    console.log('Active routes tab content mounted/updated', { 
      highlightedDeliveryId, 
      routeState: routeState ? 'present' : 'not present', 
      deliveryToHighlight 
    });
  }, [highlightedDeliveryId, routeState, deliveryToHighlight]);

  return (
    <ActiveRoutesTab 
      onCreateRoute={onCreateRoute} 
      highlightedDeliveryId={deliveryToHighlight}
    />
  );
});

export default ActiveTabContent;
