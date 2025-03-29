
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Pencil, Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; 
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
  const [viewMode, setViewMode] = useState<'list' | 'dropdown'>('dropdown');
  
  const filteredLocations = availableLocations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (loc.address && loc.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAdd = () => {
    if (selectedLocation) {
      console.log("Adding location with cylinders:", cylinders, selectedLocation);
      onAdd({ ...selectedLocation, cylinders });
      setSelectedLocation(null);
      setCylinders(10);
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
    setIsEditDialogOpen(false); // Close dialog after saving
  };
  
  // Debug logging
  useEffect(() => {
    console.log("LocationSelector - Available locations:", availableLocations);
    console.log("LocationSelector - Selected location:", selectedLocation);
  }, [availableLocations, selectedLocation]);

  // Handle dropdown selection properly
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
              <Label htmlFor="location" className="text-white">Select Location</Label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search locations..." 
                    className="pl-8 h-9 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">View as {viewMode === 'list' ? 'Dropdown' : 'List'}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => setViewMode('list')}>
                      List View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('dropdown')}>
                      Dropdown View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {viewMode === 'dropdown' ? (
              <Select
                value={selectedLocation ? selectedLocation.id.toString() : ''}
                onValueChange={handleLocationSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-popover">
                  {filteredLocations.map((location) => (
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <RadioGroup 
                value={selectedLocation ? selectedLocation.id.toString() : ''} 
                onValueChange={(value) => {
                  console.log("Radio selection changed:", value);
                  const location = availableLocations.find(l => l.id.toString() === value);
                  setSelectedLocation(location || null);
                }}
              >
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {filteredLocations.map((location) => (
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
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {filteredLocations.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                No locations found. Try a different search term or add new locations.
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cylinders" className="text-white">Number of Cylinders</Label>
              <div className="text-sm font-medium text-white">{cylinders}</div>
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
            <p className="text-xs text-gray-300">Maximum 25 cylinders per location</p>
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
