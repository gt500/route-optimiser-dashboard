
import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { LocationType } from '@/components/locations/LocationEditDialog';

interface LocationListProps {
  selectedLocation: LocationType | null;
  filteredLocations: LocationType[];
  handleLocationSelect: (value: string) => void;
  handleEditClick: (location: LocationType) => void;
  disabled?: boolean;
}

const LocationList = ({ 
  selectedLocation, 
  filteredLocations, 
  handleLocationSelect, 
  handleEditClick, 
  disabled = false 
}: LocationListProps) => {
  return (
    <RadioGroup 
      value={selectedLocation ? selectedLocation.id.toString() : ''} 
      onValueChange={(value) => {
        console.log("Radio selection changed:", value);
        handleLocationSelect(value);
      }}
      disabled={disabled}
    >
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <div 
              key={location.id.toString()}
              className="flex items-center space-x-2 border rounded-md p-3 bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <RadioGroupItem 
                value={location.id.toString()} 
                id={`location-${location.id}`} 
                className="cursor-pointer"
              />
              <Label htmlFor={`location-${location.id}`} className="flex-1 cursor-pointer">
                <div className="font-medium text-white">{location.name}</div>
                <div className="text-xs text-gray-300">{location.address}</div>
              </Label>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(location);
                }}
                disabled={disabled}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No locations found. Try a different search term.
          </div>
        )}
      </div>
    </RadioGroup>
  );
};

export default LocationList;
