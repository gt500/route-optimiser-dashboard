
import { useState, useCallback, useEffect } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { RouteState } from './types';

export const useRoutePageState = (
  initialRouteLocations: LocationType[],
  handleOptimize: () => void,
  handleConfirmLoad: () => void,
  handleCreateNewRoute: () => void,
  isLoadConfirmed: boolean,
  route: RouteState
) => {
  // Initialize with the "create" tab since we need to create routes first
  const [activeTab, setActiveTab] = useState("create");
  const [highlightedDeliveryId, setHighlightedDeliveryId] = useState<string | null>(null);
  
  // Check if route can be optimized (enough locations)
  const isOptimizeDisabled = route.locations.length < 3;
  
  // When load is confirmed, switch to active tab to view the created route
  useEffect(() => {
    if (isLoadConfirmed) {
      setTimeout(() => {
        // Switch to the active tab to show the newly created route
        setActiveTab("active");
      }, 1200); // Delay to allow the toast notification to be visible first
    }
  }, [isLoadConfirmed]);
  
  // Optimize route handler
  const handleOptimizeRoute = useCallback(() => {
    if (isOptimizeDisabled) {
      return;
    }
    
    handleOptimize();
  }, [isOptimizeDisabled, handleOptimize]);
  
  return {
    activeTab,
    setActiveTab,
    highlightedDeliveryId,
    handleOptimizeRoute,
    isOptimizeDisabled
  };
};
