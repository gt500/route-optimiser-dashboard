
import { useState } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';

export const useLocationSync = (initialLocations: LocationType[] = []) => {
  const [availableLocations, setAvailableLocations] = useState<LocationType[]>(initialLocations);
  const [isSyncingLocations, setIsSyncingLocations] = useState(false);

  return {
    availableLocations,
    setAvailableLocations,
    isSyncingLocations
  };
};
