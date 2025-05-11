
import { useState, useCallback, useMemo } from 'react';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { toast } from 'sonner';

export const useLocationManagement = (
  initialLocations: LocationType[],
  setAvailableLocations: React.Dispatch<React.SetStateAction<LocationType[]>>,
  handleUpdateLocations: (locations: LocationType[]) => void,
  selectedCountry: string,
  selectedRegion: string
) => {
  const [newLocationDialog, setNewLocationDialog] = useState(false);
  
  const addNewLocation = useCallback(() => {
    setNewLocationDialog(true);
  }, []);

  const handleSaveNewLocation = useCallback(async (location: LocationType) => {
    const newLocationId = crypto.randomUUID();
    
    const newLocation = {
      ...location,
      id: newLocationId,
      country: selectedCountry,
      region: selectedRegion
    };
    
    const updatedLocations = [...initialLocations, newLocation];
    setAvailableLocations(updatedLocations);
    handleUpdateLocations(updatedLocations);
    toast.success(`Added new location: ${location.name}`);
  }, [initialLocations, selectedCountry, selectedRegion, setAvailableLocations, handleUpdateLocations]);

  return {
    newLocationDialog,
    setNewLocationDialog,
    addNewLocation,
    handleSaveNewLocation
  };
};
