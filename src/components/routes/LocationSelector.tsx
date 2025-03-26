
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Pencil } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LocationType } from '../locations/LocationEditDialog';
import LocationEditDialog from '../locations/LocationEditDialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface LocationSelectorProps {
  onAdd: (location: LocationType & { cylinders: number }) => void;
  availableLocations: LocationType[];
  onUpdateLocations: (locations: LocationType[]) => void;
}

const LocationSelector = ({ onAdd, availableLocations, onUpdateLocations }: LocationSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [cylinders, setCylinders] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editLocation, setEditLocation] = useState<LocationType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const filteredLocations = availableLocations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAdd = () => {
    if (selectedLocation) {
      onAdd({ ...selectedLocation, cylinders });
      setSelectedLocation(null);
      setCylinders(10);
      toast.success(`Added ${selectedLocation.name} to route`);
    } else {
      toast.error("Please select a location");
    }
  };

  const handleEditClick = (location: LocationType) => {
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleSaveLocation = (updatedLocation: LocationType) => {
    const updatedLocations = availableLocations.map(loc => 
      loc.id === updatedLocation.id ? updatedLocation : loc
    );
    onUpdateLocations(updatedLocations);
    toast.success(`Location "${updatedLocation.name}" updated successfully`);
  };
  
  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Add Location to Route</CardTitle>
          <CardDescription>Select a delivery location and specify the number of cylinders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Select Location</Label>
              <Input 
                placeholder="Search locations..." 
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <RadioGroup 
              value={selectedLocation ? selectedLocation.id.toString() : ''} 
              onValueChange={(value) => {
                const location = availableLocations.find(l => l.id.toString() === value);
                setSelectedLocation(location || null);
              }}
            >
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {filteredLocations.map((location) => (
                  <div 
                    key={location.id}
                    className="flex items-center space-x-2 border rounded-md p-3 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <RadioGroupItem 
                      value={location.id.toString()} 
                      id={`location-${location.id}`} 
                      className="cursor-pointer"
                      onClick={() => setSelectedLocation(location)}
                    />
                    <Label htmlFor={`location-${location.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.address}</div>
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(location);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cylinders">Number of Cylinders</Label>
              <div className="text-sm font-medium">{cylinders}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCylinders(Math.max(1, cylinders - 1))}
                disabled={cylinders <= 1}
              >
                -
              </Button>
              <Progress value={(cylinders/25)*100} className="flex-1 h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCylinders(Math.min(25, cylinders + 1))}
                disabled={cylinders >= 25}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Maximum 25 cylinders per location</p>
          </div>
          
          <div className="pt-2">
            <Button onClick={handleAdd} className="w-full gap-2" disabled={!selectedLocation}>
              <Plus className="h-4 w-4" />
              Add to Route
            </Button>
          </div>
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
