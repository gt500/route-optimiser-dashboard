
import React from 'react';
import ActiveRoutesTab from '../ActiveRoutesTab';

interface ActiveTabContentProps {
  onCreateRoute: () => void;
  highlightedDeliveryId: string | null;
}

const ActiveTabContent: React.FC<ActiveTabContentProps> = ({
  onCreateRoute,
  highlightedDeliveryId
}) => {
  return (
    <ActiveRoutesTab 
      onCreateRoute={onCreateRoute} 
      highlightedDeliveryId={highlightedDeliveryId}
    />
  );
};

export default ActiveTabContent;
