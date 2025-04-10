
import { useState } from 'react';
import { LocationInfo } from '@/types/location';
import { filterLocations } from '@/utils/locationUtils';

export const useLocationFilters = (locations: LocationInfo[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredLocations = filterLocations(locations, searchTerm, activeTab);

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filteredLocations
  };
};
