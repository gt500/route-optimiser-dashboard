
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationType } from '../../locations/LocationEditDialog';
import LocationEditDialog from '../../locations/LocationEditDialog';
import { toast } from 'sonner';
import LocationSearch from './LocationSearch';
import ViewToggle from './ViewToggle';
import LocationDropdown from './LocationDropdown';
import LocationList from './LocationList';
import CylinderSelector from './CylinderSelector';
import AddButton from './AddButton';

interface LocationSelectorProps {
  availableLocations: LocationType[];
  onSelectLocation: (location: LocationType & { cylinders: number }) => void;
  disabled?: boolean;
  onUpdateLocations?: (locations: LocationType[]) => void;
}

const LocationSelector = ({ 
  onSelectLocation, 
  availableLocations, 
  disabled = false,
  onUpdateLocations = () => {}
}: LocationSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [cylinders, setCylinders] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editLocation, setEditLocation] = useState<LocationType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'dropdown'>('dropdown');
  
  const filteredLocations = availableLocations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (loc.address && loc.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAdd = () => {
    if (selectedLocation) {
      console.log("Adding location with cylinders:", cylinders, selectedLocation);
      const locationWithStringId = {
        ...selectedLocation,
        id: selectedLocation.id.toString(),
        cylinders,
        emptyCylinders: cylinders
      };
      onSelectLocation(locationWithStringId);
      toast.success(`Added ${selectedLocation.name} to route`);
    } else {
      toast.error("Please select a location");
    }
  };

  const handleEditClick = (location: LocationType) => {
    console.log("Edit location clicked:", location);
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleSaveLocation = (updatedLocation: LocationType) => {
    console.log("Saving location:", updatedLocation);
    const updatedLocations = availableLocations.map(loc => 
      loc.id === updatedLocation.id ? updatedLocation : loc
    );
    onUpdateLocations(updatedLocations);
    toast.success(`Location "${updatedLocation.name}" updated successfully`);
    setIsEditDialogOpen(false);
  };

  useEffect(() => {
    console.log("LocationSelector - Available locations:", availableLocations);
    if (availableLocations.length > 0 && !selectedLocation) {
      // Pre-select first location if none selected
      setSelectedLocation(availableLocations[0]);
    }
  }, [availableLocations]);

  const handleLocationSelect = (value: string) => {
    console.log("Location selected with ID:", value);
    const location = availableLocations.find(loc => loc.id.toString() === value);
    console.log("Found location:", location);
    setSelectedLocation(location || null);
  };

  return (
    <>
      <Card className="shadow-sm bg-black">
        <CardHeader>
          <CardTitle className="text-base text-white">Add Location to Route</CardTitle>
          <CardDescription className="text-gray-300">Select a delivery location and specify the number of cylinders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <LocationSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                disabled={disabled} 
              />
              <ViewToggle 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
                disabled={disabled} 
              />
            </div>
            
            {viewMode === 'dropdown' ? (
              <LocationDropdown
                selectedLocation={selectedLocation}
                filteredLocations={filteredLocations}
                handleLocationSelect={handleLocationSelect}
                handleEditClick={handleEditClick}
                disabled={disabled}
              />
            ) : (
              <LocationList
                selectedLocation={selectedLocation}
                filteredLocations={filteredLocations}
                handleLocationSelect={handleLocationSelect}
                handleEditClick={handleEditClick}
                disabled={disabled}
              />
            )}
            
            {filteredLocations.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                No locations found. Try a different search term or add new locations.
              </div>
            )}
          </div>
          
          <CylinderSelector 
            cylinders={cylinders} 
            setCylinders={setCylinders} 
            disabled={disabled} 
          />
          
          <AddButton 
            handleAdd={handleAdd} 
            disabled={!selectedLocation || filteredLocations.length === 0 || disabled} 
          />
        </CardContent>
      </Card>

      <LocationEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        location={editLocation}
        onSave={handleSaveLocation}
      />
    </>
  );
};

export default LocationSelector;
