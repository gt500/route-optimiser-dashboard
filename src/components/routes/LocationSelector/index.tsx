
import React, { useState } from 'react';
import { LocationType } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

interface LocationSelectorProps {
  locations: LocationType[];
  onSelect: (locationId: string, cylinders: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ locations, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [cylinderCount, setCylinderCount] = useState<number>(10);

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToRoute = () => {
    if (selectedLocation) {
      onSelect(selectedLocation, cylinderCount);
      setSelectedLocation('');
      setCylinderCount(10);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <Input
        type="text"
        placeholder="Search locations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      <div className="border rounded-md overflow-hidden">
        {filteredLocations.length > 0 ? (
          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.map(location => (
              <div 
                key={location.id}
                className={`p-2 border-b flex justify-between items-center cursor-pointer ${
                  selectedLocation === location.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedLocation(location.id)}
              >
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocation(location.id);
                    onSelect(location.id, cylinderCount);
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No locations found
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="1"
            max="50"
            value={cylinderCount}
            onChange={(e) => setCylinderCount(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <Button onClick={handleAddToRoute}>Add to Route</Button>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
