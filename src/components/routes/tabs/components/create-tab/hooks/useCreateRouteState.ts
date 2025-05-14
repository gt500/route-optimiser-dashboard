
import React, { useMemo, useState } from 'react';
import { LocationType } from '@/types/location';
import { LocationInfo } from '@/types/location';

interface UseCreateRouteStateProps {
  locations: LocationType[];
  [key: string]: any;
}

export const useCreateRouteState = (route: UseCreateRouteStateProps, propTransformedLocations: any[]) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isOptimizationPanelVisible, setIsOptimizationPanelVisible] = useState(false);
  
  // Determine route name based on start and end locations
  const getRouteName = () => {
    if (route.locations.length < 2) return '';
    
    // Check for common route patterns
    const startName = route.locations[0]?.name || '';
    const endName = route.locations[route.locations.length - 1]?.name || '';
    
    if (startName.includes('Afrox') && endName.includes('West Coast')) {
      return 'Cape Town Urban Delivery';
    } else if (startName.includes('Hugo') && endName.includes('Zevenwacht')) {
      return 'Northern Suburbs Route';
    } else if (startName.includes('Stellenbosch') && endName.includes('Simonsrust')) {
      return 'Winelands Delivery';
    }
    
    // Default: combine start and end locations
    return `${startName} to ${endName}`;
  };

  // Transform locations to ensure they match the LocationInfo interface
  const computedLocations = useMemo(() => {
    return route.locations.map(loc => ({
      id: loc.id.toString(),
      name: loc.name,
      latitude: loc.lat,
      longitude: loc.long,
      address: loc.address || '', // Provide empty string as default for address
    }));
  }, [route.locations]);

  // Use the provided transformed locations from props, or fall back to computed ones
  // Make sure all locations have the required address field
  const displayLocations: LocationInfo[] = useMemo(() => {
    const baseLocations = propTransformedLocations || computedLocations;
    return baseLocations.map(loc => ({
      ...loc,
      address: loc.address || ''  // Ensure address is always present
    }));
  }, [propTransformedLocations, computedLocations]);

  const handleOptimizeClick = () => {
    setIsOptimizationPanelVisible(true);
  };

  return {
    activeTab,
    setActiveTab,
    isOptimizationPanelVisible,
    setIsOptimizationPanelVisible,
    getRouteName,
    displayLocations,
    handleOptimizeClick
  };
};
