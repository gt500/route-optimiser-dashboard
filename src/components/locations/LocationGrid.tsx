
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { LocationInfo } from '@/types/location';
import LocationCard from './LocationCard';

interface LocationGridProps {
  locations: LocationInfo[];
  onEdit: (location: LocationInfo) => void;
  onDelete: (id: string) => void;
}

const LocationGrid: React.FC<LocationGridProps> = ({ locations, onEdit, onDelete }) => {
  if (locations.length === 0) {
    return (
      <CardContent className="py-10 text-center text-muted-foreground bg-black">
        No locations found. Try adjusting your filters or add a new location.
      </CardContent>
    );
  }

  return (
    <CardContent className="bg-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location, index) => (
          <LocationCard 
            key={location.id} 
            location={location} 
            onEdit={onEdit} 
            onDelete={onDelete}
            index={index}
          />
        ))}
      </div>
    </CardContent>
  );
};

export default LocationGrid;
