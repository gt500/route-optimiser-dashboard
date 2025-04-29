
import React, { useState, useEffect } from 'react';
import { LocationType } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Cylinder, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import CylinderSelector from './CylinderSelector';
import { MAX_CYLINDERS, CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight } from '@/utils/route/weightUtils';

interface LocationSelectorProps {
  locations: LocationType[];
  onSelect: (locationId: string, cylinders: number) => void;
  routeLocations: LocationType[];
  startLocationId?: string | null;
  endLocationId?: string | null;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  locations, 
  onSelect, 
  routeLocations,
  startLocationId,
  endLocationId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [cylinderCount, setCylinderCount] = useState<number>(10);
  
  // Calculate current route weight
  const currentRouteWeight = calculateTotalWeight(routeLocations, startLocationId, endLocationId);
  const maxWeight = MAX_CYLINDERS * CYLINDER_WEIGHT_KG;
  const remainingWeight = Math.max(0, maxWeight - currentRouteWeight);
  const maxAddableCylinders = Math.floor(remainingWeight / CYLINDER_WEIGHT_KG);
  const isAtWeightLimit = currentRouteWeight >= maxWeight;

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Effect to limit cylinder count based on remaining weight
  useEffect(() => {
    if (cylinderCount > maxAddableCylinders) {
      setCylinderCount(Math.max(1, maxAddableCylinders));
    }
  }, [maxAddableCylinders]);

  const handleAddToRoute = () => {
    if (selectedLocation) {
      if (isAtWeightLimit) {
        toast.error("Cannot add more stops - weight limit reached!");
        return;
      }
      
      // Ensure we're passing the exact cylinder count the user selected
      onSelect(selectedLocation, cylinderCount);
      console.log(`Adding location with ${cylinderCount} cylinders`);
      
      setSelectedLocation('');
      setCylinderCount(Math.min(10, maxAddableCylinders));
    }
  };

  const handleCylinderChange = (newCount: number) => {
    // Ensure cylinder count doesn't exceed limits
    const validCount = Math.min(maxAddableCylinders, Math.max(1, newCount));
    console.log(`Setting cylinder count to ${validCount}`);
    setCylinderCount(validCount);
  };

  return (
    <div className="space-y-4 mt-2">
      {isAtWeightLimit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Weight limit reached - cannot add more route stops</span>
        </div>
      )}
      
      <div className="relative">
        <Input
          type="text"
          placeholder="Search route stops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9"
          disabled={isAtWeightLimit}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      
      {!isAtWeightLimit && (
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Current load: {Math.round(currentRouteWeight)}kg / {maxWeight}kg</span>
          <span>Can add up to {maxAddableCylinders} more cylinders</span>
        </div>
      )}

      <div className="border rounded-md overflow-hidden bg-slate-50">
        {filteredLocations.length > 0 ? (
          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.map(location => (
              <div 
                key={location.id}
                className={`p-2 border-b flex justify-between items-center cursor-pointer ${
                  selectedLocation === location.id ? 'bg-accent' : ''
                } hover:bg-slate-100 ${isAtWeightLimit ? 'opacity-50' : ''}`}
                onClick={() => !isAtWeightLimit && setSelectedLocation(location.id)}
              >
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLocation === location.id && !isAtWeightLimit && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCylinderChange(cylinderCount - 1);
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
                          handleCylinderChange(cylinderCount + 1);
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
                      if (isAtWeightLimit) {
                        toast.error("Cannot add more stops - weight limit reached!");
                        return;
                      }
                      setSelectedLocation(location.id);
                    }}
                    disabled={isAtWeightLimit}
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

      {selectedLocation && !isAtWeightLimit && (
        <div className="p-4 bg-blue-900 rounded-md">
          <CylinderSelector 
            cylinders={cylinderCount} 
            setCylinders={(value) => handleCylinderChange(value)} 
            maxCylinders={maxAddableCylinders}
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
