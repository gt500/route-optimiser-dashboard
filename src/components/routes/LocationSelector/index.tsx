
import React, { useState } from 'react';
import { LocationType } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Cylinder, Search } from 'lucide-react';
import CylinderSelector from './CylinderSelector';

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
      <div className="relative">
        <Input
          type="text"
          placeholder="Search route stops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="border rounded-md overflow-hidden bg-slate-50">
        {filteredLocations.length > 0 ? (
          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.map(location => (
              <div 
                key={location.id}
                className={`p-2 border-b flex justify-between items-center cursor-pointer ${
                  selectedLocation === location.id ? 'bg-accent' : ''
                } hover:bg-slate-100`}
                onClick={() => setSelectedLocation(location.id)}
              >
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLocation === location.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCylinderCount(Math.max(1, cylinderCount - 1));
                        }}
                      >
                        -
                      </Button>
                      <div className="bg-blue-500 rounded-full h-6 w-6 flex items-center justify-center text-white font-medium text-sm">
                        {cylinderCount}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCylinderCount(Math.min(25, cylinderCount + 1));
                        }}
                      >
                        +
                      </Button>
                    </div>
                  )}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No route stops found
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="p-4 bg-blue-900 rounded-md">
          <CylinderSelector 
            cylinders={cylinderCount} 
            setCylinders={setCylinderCount} 
          />
          <Button 
            onClick={handleAddToRoute} 
            className="w-full mt-3"
          >
            Add to Route
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
