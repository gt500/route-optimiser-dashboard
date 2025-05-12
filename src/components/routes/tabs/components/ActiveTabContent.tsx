
import React, { useEffect } from 'react';
import ActiveRoutesTab from '../ActiveRoutesTab';

interface ActiveTabContentProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveTabContent: React.FC<ActiveTabContentProps> = ({ 
  onCreateRoute,
  highlightedDeliveryId 
}) => {
  // Log when active routes component mounts or updates
  useEffect(() => {
    console.log('Active routes tab content mounted/updated', { highlightedDeliveryId });
  }, [highlightedDeliveryId]);

  return (
    <ActiveRoutesTab 
      onCreateRoute={onCreateRoute} 
      highlightedDeliveryId={highlightedDeliveryId}
    />
  );
};

export default ActiveTabContent;
