
import { useState, useEffect, useMemo } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { useLocation } from 'react-router-dom';

export const useRoutePageState = (
  initialLocations: LocationType[],
  handleOptimize: () => void,
  handleConfirmLoad: () => void,
  handleCreateNewRoute: () => void,
  isLoadConfirmed: boolean,
  route: any
) => {
  const location = useLocation();
  const locationState = location.state as { activeTab?: string; highlightDelivery?: string } | null;
  
  const [activeTab, setActiveTab] = useState(locationState?.activeTab || 'create');
  const [highlightedDeliveryId, setHighlightedDeliveryId] = useState<string | null>(
    locationState?.highlightDelivery || null
  );
  
  // Handle URL state updates
  useEffect(() => {
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
    
    if (locationState?.highlightDelivery) {
      setHighlightedDeliveryId(locationState.highlightDelivery);
    }
  }, [location, locationState]);

  // Auto-clear the highlight after timeout
  useEffect(() => {
    if (highlightedDeliveryId) {
      const timer = setTimeout(() => {
        setHighlightedDeliveryId(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedDeliveryId]);

  // Handler for optimize button
  const handleOptimizeRoute = () => {
    handleOptimize();
  };
    
  const isOptimizeDisabled = useMemo(() => {
    return route.locations.length < 3 || isLoadConfirmed;
  }, [route.locations.length, isLoadConfirmed]);
  
  return {
    activeTab,
    setActiveTab,
    highlightedDeliveryId,
    handleOptimizeRoute,
    isOptimizeDisabled
  };
};
