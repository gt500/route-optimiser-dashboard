
import React from 'react';
import { useActiveRoutes } from './active-routes/useActiveRoutes';
import ActiveRoutesContent from './active-routes/ActiveRoutesContent';

interface ActiveRoutesTabProps {
  onCreateRoute: () => void;
  highlightedDeliveryId?: string | null;
}

const ActiveRoutesTab = ({ onCreateRoute, highlightedDeliveryId }: ActiveRoutesTabProps) => {
  // Use our custom hook to handle routes logic
  const {
    routes,
    isLoading,
    processingRoutes,
    handleStartRoute,
    handleCompleteRoute
  } = useActiveRoutes(highlightedDeliveryId);

  return (
    <ActiveRoutesContent
      routes={routes}
      isLoading={isLoading}
      processingRoutes={processingRoutes}
      onStartRoute={handleStartRoute}
      onCompleteRoute={handleCompleteRoute}
      onCreateRoute={onCreateRoute}
      highlightedDeliveryId={highlightedDeliveryId}
    />
  );
};

export default ActiveRoutesTab;
