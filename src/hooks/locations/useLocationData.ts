import { useState, useEffect } from 'react';
import { fetchLocationsFromAPI } from '@/utils/locationUtils';
import { LocationInfo } from '@/types/location';
import { toast } from 'sonner';

export const useLocationData = () => {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const data = await fetchLocationsFromAPI();
      console.log('Fetched locations with region/country data:', data);
      
      // Validate that the data structure is correct
      if (Array.isArray(data)) {
        setLocations(data);
      } else {
        console.error('Invalid location data structure received:', data);
        toast.error('Invalid location data format received');
        setError('Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to fetch locations: ${errorMessage}`);
      // Keep the previous locations data if there was an error
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
    error,
    fetchLocations
  };
};
