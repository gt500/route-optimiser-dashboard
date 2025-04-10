
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { LocationType } from '@/components/locations/LocationEditDialog';

interface LocationDropdownProps {
  selectedLocation: LocationType | null;
  filteredLocations: LocationType[];
  handleLocationSelect: (value: string) => void;
  handleEditClick: (location: LocationType) => void;
  disabled?: boolean;
}

const LocationDropdown = ({ 
  selectedLocation, 
  filteredLocations, 
  handleLocationSelect, 
  handleEditClick, 
  disabled = false 
}: LocationDropdownProps) => {
  return (
    <Select
      value={selectedLocation ? selectedLocation.id.toString() : ''}
      onValueChange={handleLocationSelect}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a location" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] bg-popover">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <SelectItem key={location.id.toString()} value={location.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <div className="pr-2">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 ml-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleEditClick(location);
                  }}
                  disabled={disabled}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-locations" disabled>No locations available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default LocationDropdown;
