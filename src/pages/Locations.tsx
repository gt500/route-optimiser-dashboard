
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Pencil, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';

// Sample location data
const locationData = [
  { id: 1, name: 'Warehouse A', type: 'Storage', address: '123 Main St, Cape Town', lat: -33.9249, long: 18.4241, fullCylinders: 45, emptyCylinders: 20 },
  { id: 2, name: 'Restaurant ABC', type: 'Customer', address: '456 Beach Rd, Sea Point', lat: -33.9113, long: 18.4053, fullCylinders: 0, emptyCylinders: 12 },
  { id: 3, name: 'Hotel Seaside', type: 'Customer', address: '789 Mountain View, Camps Bay', lat: -33.9500, long: 18.3836, fullCylinders: 0, emptyCylinders: 15 },
  { id: 4, name: 'Restaurant XYZ', type: 'Customer', address: '101 Long St, City Center', lat: -33.9248, long: 18.4173, fullCylinders: 0, emptyCylinders: 8 },
  { id: 5, name: 'Hotel Mountain', type: 'Customer', address: '234 Kloof St, Gardens', lat: -33.9263, long: 18.4132, fullCylinders: 0, emptyCylinders: 23 },
  { id: 6, name: 'Warehouse B', type: 'Storage', address: '567 Industrial Ave, Epping', lat: -33.9312, long: 18.5342, fullCylinders: 78, emptyCylinders: 12 },
];

const LocationTable = ({ locations, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>GPS Coordinates</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id} className="transition-colors hover:bg-secondary/30">
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>
                <Badge variant={location.type === 'Storage' ? 'secondary' : 'outline'}>
                  {location.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{location.address}</TableCell>
              <TableCell>{location.lat}, {location.long}</TableCell>
              <TableCell>
                {location.type === 'Storage' ? (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {location.fullCylinders} full
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {location.emptyCylinders} empty
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {location.emptyCylinders} empty
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(location)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(location.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const LocationMap = () => {
  return (
    <div className="h-[400px] bg-gray-100 rounded-lg relative overflow-hidden border border-border">
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        <div className="text-center space-y-3">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Map visualization will appear here</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">All location coordinates will be displayed on the map</p>
        </div>
      </div>
    </div>
  );
};

const Locations = () => {
  const [locations, setLocations] = useState(locationData);
  const [editLocation, setEditLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (location) => {
    setEditLocation(location);
  };

  const handleDelete = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
    toast({
      title: "Location deleted",
      description: "The location has been removed successfully.",
    });
  };

  const handleSave = (updatedLocation) => {
    if (editLocation) {
      setLocations(locations.map(loc => 
        loc.id === updatedLocation.id ? updatedLocation : loc
      ));
      setEditLocation(null);
      toast({
        title: "Location updated",
        description: "The location details have been updated successfully.",
      });
    } else {
      // Add new location
      const newLocation = {
        ...updatedLocation,
        id: locations.length + 1,
      };
      setLocations([...locations, newLocation]);
      setIsAddDialogOpen(false);
      toast({
        title: "Location added",
        description: "New location has been added successfully.",
      });
    }
  };

  const LocationForm = ({ location, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      id: location?.id || 0,
      name: location?.name || '',
      type: location?.type || 'Customer',
      address: location?.address || '',
      lat: location?.lat || '',
      long: location?.long || '',
      fullCylinders: location?.fullCylinders || 0,
      emptyCylinders: location?.emptyCylinders || 0,
      isWarehouse: location?.type === 'Storage'
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (checked) => {
      setFormData({ 
        ...formData, 
        isWarehouse: checked,
        type: checked ? 'Storage' : 'Customer'
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Basic validation
      if (!formData.name || !formData.address || !formData.lat || !formData.long) {
        toast({
          title: "Validation error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Location Name*</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="Enter location name"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isWarehouse" 
              checked={formData.isWarehouse}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isWarehouse">This is a warehouse/storage location</Label>
          </div>
          
          <div>
            <Label htmlFor="address">Address*</Label>
            <Textarea 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="Enter full address"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude*</Label>
              <Input 
                id="lat" 
                name="lat" 
                value={formData.lat} 
                onChange={handleChange}
                placeholder="e.g. -33.9248"
              />
            </div>
            <div>
              <Label htmlFor="long">Longitude*</Label>
              <Input 
                id="long" 
                name="long" 
                value={formData.long} 
                onChange={handleChange}
                placeholder="e.g. 18.4173"
              />
            </div>
          </div>
          
          {formData.isWarehouse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullCylinders">Full Cylinders</Label>
                <Input 
                  id="fullCylinders" 
                  name="fullCylinders" 
                  type="number" 
                  value={formData.fullCylinders} 
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="emptyCylinders">Empty Cylinders</Label>
                <Input 
                  id="emptyCylinders" 
                  name="emptyCylinders" 
                  type="number" 
                  value={formData.emptyCylinders} 
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage delivery and pickup locations</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Locations</CardTitle>
                  <CardDescription>Manage and edit location details</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search locations..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LocationTable 
                locations={filteredLocations} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          {editLocation && (
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Edit Location</CardTitle>
                <CardDescription>Modify location details</CardDescription>
              </CardHeader>
              <CardContent>
                <LocationForm 
                  location={editLocation}
                  onSave={handleSave}
                  onCancel={() => setEditLocation(null)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="map">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>Visual overview of all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <LocationMap />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the details for the new location
            </DialogDescription>
          </DialogHeader>
          <LocationForm 
            onSave={handleSave}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
