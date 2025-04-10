
import { useState, useEffect } from 'react';
import { fetchLocationsFromAPI } from '@/utils/locationUtils';
import { LocationInfo } from '@/types/location';

export const useLocationData = () => {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  const fetchLocations = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchLocationsFromAPI();
      console.log('Fetched locations:', data);
      setLocations(data);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    setLocations,
    isSyncing,
    fetchLocations
  };
};
