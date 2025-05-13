
import React, { useEffect } from 'react';
import ActiveRoutesTab from '../ActiveRoutesTab';
import { useLocation } from 'react-router-dom';

interface ActiveTabContentProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveTabContent: React.FC<ActiveTabContentProps> = ({ 
  onCreateRoute,
  highlightedDeliveryId 
}) => {
  const location = useLocation();
  const routeState = location.state as { highlightDelivery?: string } | null;
  
  // Use the highlighted delivery from props or route state
  const deliveryToHighlight = highlightedDeliveryId || (routeState?.highlightDelivery || null);
  
  // Log when active routes component mounts or updates
  useEffect(() => {
    console.log('Active routes tab content mounted/updated', { 
      highlightedDeliveryId, 
      routeState, 
      deliveryToHighlight 
    });
  }, [highlightedDeliveryId, routeState, deliveryToHighlight]);

  return (
    <ActiveRoutesTab 
      onCreateRoute={onCreateRoute} 
      highlightedDeliveryId={deliveryToHighlight}
    />
  );
};

export default ActiveTabContent;
