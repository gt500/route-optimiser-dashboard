
import { useLocationData } from './locations/useLocationData';
import { useLocationFilters } from './locations/useLocationFilters';
import { useLocationEdit } from './locations/useLocationEdit';

export const useLocations = () => {
  const { locations, setLocations, isSyncing, fetchLocations } = useLocationData();
  const { searchTerm, setSearchTerm, activeTab, setActiveTab, filteredLocations } = 
    useLocationFilters(locations);
  const { 
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
  } = useLocationEdit(locations, setLocations);

  return {
    // Data
    locations,
    filteredLocations,
    isSyncing,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    
    // Edit related
    editLocation,
    isEditDialogOpen,
    setIsEditDialogOpen,
    
    // Delete related
    locationToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    
    // Actions
    handleEdit,
    handleSaveLocation,
    openDeleteConfirmation,
    handleDelete,
    handleAddNew
  };
};
