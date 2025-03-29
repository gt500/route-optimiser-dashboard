
import React from 'react';
import { useLocations } from '@/hooks/useLocations';
import LocationHeader from '@/components/locations/LocationHeader';
import LocationSearch from '@/components/locations/LocationSearch';
import LocationTabs from '@/components/locations/LocationTabs';
import LocationActions from '@/components/locations/LocationActions';
import LocationEditDialog from '@/components/locations/edit/LocationEditDialog';

const Locations: React.FC = () => {
  const {
    locations,
    filteredLocations,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    editLocation,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleSaveLocation,
    openDeleteConfirmation,
    handleDelete,
    handleAddNew
  } = useLocations();

  return (
    <div className="space-y-6 animate-fade-in">
      <LocationHeader onAddNew={handleAddNew} />
      
      <div className="flex items-center space-x-2 bg-black p-4 rounded-lg">
        <LocationSearch searchTerm={searchTerm} onChange={setSearchTerm} />
      </div>

      <LocationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredLocations={filteredLocations}
        allLocations={locations}
        onEdit={handleEdit}
        onDelete={openDeleteConfirmation}
      />
      
      <LocationEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        location={editLocation ? {
          id: editLocation.id,
          name: editLocation.name,
          address: editLocation.address,
          lat: editLocation.latitude,
          long: editLocation.longitude,
          type: editLocation.type || 'Customer',
          fullCylinders: editLocation.fullCylinders,
          emptyCylinders: editLocation.emptyCylinders,
          isWarehouse: editLocation.type === 'Storage',
          open_time: editLocation.open_time,
          close_time: editLocation.close_time
        } : null}
        onSave={handleSaveLocation}
      />

      <LocationActions
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Locations;
