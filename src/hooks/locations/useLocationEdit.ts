
import { useState } from 'react';
import { LocationInfo } from '@/types/location';

export const useLocationEdit = (
  locations: LocationInfo[], 
  setLocations: React.Dispatch<React.SetStateAction<LocationInfo[]>>
) => {
  const [editLocation, setEditLocation] = useState<LocationInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationInfo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (location: LocationInfo) => {
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleSaveLocation = (updatedLocation: LocationInfo) => {
    // If it's a new location, add it to the list
    if (!updatedLocation.id) {
      const newLocation = {
        ...updatedLocation,
        id: `loc-${Date.now()}`, // Generate a temporary ID
      };
      
      setLocations((prevLocations: LocationInfo[]) => [...prevLocations, newLocation]);
    } else {
      // If it's an existing location, update it
      setLocations((prevLocations: LocationInfo[]) => 
        prevLocations.map((loc) => 
          loc.id === updatedLocation.id ? updatedLocation : loc
        )
      );
    }
    
    setIsEditDialogOpen(false);
    setEditLocation(null);
  };

  const openDeleteConfirmation = (location: LocationInfo) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (locationToDelete) {
      setLocations((prevLocations: LocationInfo[]) => 
        prevLocations.filter((loc) => loc.id !== locationToDelete.id)
      );
      
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  const handleAddNew = () => {
    const emptyLocation: LocationInfo = {
      id: '',
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      type: 'Customer',
      fullCylinders: 0,
      emptyCylinders: 0,
      open_time: '09:00',
      close_time: '17:00'
    };
    
    setEditLocation(emptyLocation);
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
