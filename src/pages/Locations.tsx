
import React from 'react';
import { useLocations } from '@/hooks/useLocations';
import LocationHeader from '@/components/locations/LocationHeader';
import LocationSearch from '@/components/locations/LocationSearch';
import LocationTabs from '@/components/locations/LocationTabs';
import LocationActions from '@/components/locations/LocationActions';
import LocationEditDialog from '@/components/locations/edit/LocationEditDialog';
import { LocationType, LocationInfo } from '@/types/location';

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

  // Create a function to convert LocationInfo to LocationType for the edit dialog
  const convertToLocationType = (location: LocationInfo | null): LocationType | null => {
    if (!location) return null;
    
    return {
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
    };
  };

  // Create wrapper function to convert LocationType back to LocationInfo
  const handleSaveLocationWrapper = (locationData: LocationType) => {
    const locationInfo: LocationInfo = {
      id: locationData.id,
      name: locationData.name,
      address: locationData.address,
      latitude: locationData.lat,
      longitude: locationData.long,
      type: locationData.type,
      fullCylinders: locationData.fullCylinders,
      emptyCylinders: locationData.emptyCylinders,
      open_time: locationData.open_time,
      close_time: locationData.close_time
    };
    
    handleSaveLocation(locationInfo);
  };

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
        onDelete={(id: string) => {
          const locationToDelete = locations.find(loc => loc.id === id);
          if (locationToDelete) {
            openDeleteConfirmation(locationToDelete);
          }
        }}
      />
      
      <LocationEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        location={convertToLocationType(editLocation)}
        onSave={handleSaveLocationWrapper}
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
