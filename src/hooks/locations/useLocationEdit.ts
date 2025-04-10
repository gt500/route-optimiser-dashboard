
import { useState } from 'react';
import { LocationInfo } from '@/types/location';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { saveLocationToAPI, deleteLocationFromAPI } from '@/utils/locationUtils';

export const useLocationEdit = (
  locations: LocationInfo[],
  setLocations: (locations: LocationInfo[]) => void
) => {
  const [editLocation, setEditLocation] = useState<LocationInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (location: LocationInfo) => {
    console.log('Editing location:', {
      id: location.id,
      name: location.name,
      address: location.address,
      lat: location.latitude,
      long: location.longitude,
      type: location.type || 'Customer',
      fullCylinders: location.fullCylinders,
      emptyCylinders: location.emptyCylinders,
      isWarehouse: location.type === 'Storage',
      open_time: location.open_time,
      close_time: location.close_time
    });
    
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveLocation = async (location: LocationType) => {
    console.log('Saving location:', location);
    const success = await saveLocationToAPI(location);
    
    if (success) {
      if (location.id) {
        // Update existing location
        setLocations(prev => 
          prev.map(loc => loc.id === location.id ? {
            ...loc,
            name: location.name,
            address: location.address,
            latitude: location.lat,
            longitude: location.long,
            type: location.type,
            open_time: location.open_time,
            close_time: location.close_time
          } : loc)
        );
      } else {
        // Add new location
        const newLocation: LocationInfo = {
          id: crypto.randomUUID(),
          name: location.name,
          address: location.address,
          latitude: location.lat,
          longitude: location.long,
          type: location.type,
          fullCylinders: location.type === 'Storage' ? 75 : 0,
          emptyCylinders: location.type === 'Customer' ? 15 : 0,
          open_time: location.open_time,
          close_time: location.close_time
        };
        
        setLocations(prev => [...prev, newLocation]);
      }
      
      setIsEditDialogOpen(false);
      setEditLocation(null);
    }
  };
  
  const openDeleteConfirmation = (id: string) => {
    setLocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!locationToDelete) return;
    
    const success = await deleteLocationFromAPI(locationToDelete);
    
    if (success) {
      setLocations(prev => prev.filter(location => location.id !== locationToDelete));
    }
    
    setLocationToDelete(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleAddNew = () => {
    setEditLocation(null);
    setIsEditDialogOpen(true);
  };

  return {
    editLocation,
    isEditDialogOpen,
    setIsEditDialogOpen,
    locationToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleSaveLocation,
    openDeleteConfirmation,
    handleDelete,
    handleAddNew
  };
};
