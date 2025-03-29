
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Search, MapPin, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LocationEditDialog from '@/components/locations/LocationEditDialog';
import RouteMap from '@/components/routes/RouteMap';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface LocationInfo {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
  fullCylinders?: number;
  emptyCylinders?: number;
  open_time?: string;
  close_time?: string;
}

interface SupabaseLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  open_time?: string;
  close_time?: string;
  type?: string;
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editLocation, setEditLocation] = useState<LocationInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);
  
  const fetchLocations = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) {
        console.error('Error fetching locations:', error);
        toast.error('Failed to fetch locations');
        return;
      }

      if (data) {
        const mappedLocations = data.map(item => {
          // Determine the type based on the location name or use existing type
          let locationType = item.type || 'Customer';
          
          // Specifically set Epping Depot as Storage if no type is set
          if (!item.type) {
            if (item.name?.toLowerCase().includes('epping') && item.name?.toLowerCase().includes('depot')) {
              locationType = 'Storage';
            } else if (item.name?.toLowerCase().includes('depot') || item.name?.toLowerCase().includes('storage')) {
              locationType = 'Storage';
            }
          }
          
          return {
            id: item.id,
            name: item.name,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            type: locationType,
            fullCylinders: locationType === 'Storage' ? 75 : 0,
            emptyCylinders: locationType === 'Customer' ? 15 : 0,
            open_time: item.open_time || '08:00',
            close_time: item.close_time || '17:00'
          };
        });
        
        console.log('Fetched locations:', mappedLocations);
        setLocations(mappedLocations);
      }
    } catch (error) {
      console.error('Error in fetchLocations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleEdit = (location: LocationInfo) => {
    console.log('Editing location:', {
      id: location.id,
      name: location.name,
      address: location.address,
      lat: location.latitude,
      long: location.longitude,
      type: location.type || 'Customer',
      fullCylinders: location.fullCylinders,
      emptyCylinders: location.emptyCylinders,
      isWarehouse: location.type === 'Storage',
      open_time: location.open_time,
      close_time: location.close_time
    });
    
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveLocation = async (location: any) => {
    console.log('Saving location:', location);
    try {
      // Construct the data object with the correct field names for the database
      const locationData = {
        name: location.name,
        address: location.address,
        latitude: location.lat,
        longitude: location.long,
        type: location.type,
        open_time: location.open_time || '08:00',
        close_time: location.close_time || '17:00'
      };
      
      console.log('Location data to save:', locationData);
      
      if (location.id) {
        // It's an edit
        const { data, error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', location.id)
          .select();
        
        if (error) {
          console.error('Error updating location:', error);
          throw error;
        }
        
        console.log('Updated location:', data);
        
        // Update local state
        setLocations(prev => 
          prev.map(loc => loc.id === location.id ? {
            ...loc,
            name: location.name,
            address: location.address,
            latitude: location.lat,
            longitude: location.long,
            type: location.type,
            open_time: location.open_time,
            close_time: location.close_time
          } : loc)
        );
        toast.success(`Location "${location.name}" updated`);
      } else {
        // It's a new location
        const newLocationId = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('locations')
          .insert({
            ...locationData,
            id: newLocationId
          })
          .select();
        
        if (error) {
          console.error('Error creating location:', error);
          throw error;
        }
        
        console.log('Created new location:', data);
        
        // Add to local state
        const newLocation: LocationInfo = {
          id: newLocationId,
          name: location.name,
          address: location.address,
          latitude: location.lat,
          longitude: location.long,
          type: location.type,
          fullCylinders: location.type === 'Storage' ? 75 : 0,
          emptyCylinders: location.type === 'Customer' ? 15 : 0,
          open_time: location.open_time,
          close_time: location.close_time
        };
        
        setLocations(prev => [...prev, newLocation]);
        toast.success(`Location "${location.name}" created`);
      }
      
      // Close the dialog after a delay to ensure state is updated
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setEditLocation(null);
      }, 100);
      
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };
  
  const openDeleteConfirmation = (id: string) => {
    setLocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!locationToDelete) return;
    
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationToDelete);
      
      if (error) throw error;
      
      // Remove from local state
      setLocations(prev => prev.filter(location => location.id !== locationToDelete));
      toast.success('Location permanently deleted');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setLocationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleAddNew = () => {
    setEditLocation(null);
    setIsEditDialogOpen(true);
  };
  
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'customers') return matchesSearch && location.type === 'Customer';
    if (activeTab === 'storage') return matchesSearch && location.type === 'Storage';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage your delivery and storage locations</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Locations ({locations.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({locations.filter(l => l.type === 'Customer').length})</TabsTrigger>
          <TabsTrigger value="storage">Storage ({locations.filter(l => l.type === 'Storage').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>Visual overview of all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RouteMap 
                  locations={filteredLocations.map(loc => ({
                    id: loc.id.toString(),
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    address: loc.address
                  }))} 
                  height="100%"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>All Locations ({filteredLocations.length})</CardTitle>
              <CardDescription>
                View and manage all your delivery and storage locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <Badge variant={location.type === 'Storage' ? "secondary" : "outline"}>
                          {location.type || 'Customer'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> 
                        {location.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          {location.type === 'Storage' && (
                            <p className="text-sm">Full cylinders: <span className="font-medium">{location.fullCylinders}</span></p>
                          )}
                          {location.type === 'Customer' && (
                            <p className="text-sm">Empty cylinders: <span className="font-medium">{location.emptyCylinders}</span></p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Hours: {location.open_time || '08:00'} - {location.close_time || '17:00'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(location.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Locations</CardTitle>
              <CardDescription>All customer delivery locations</CardDescription>
            </CardHeader>
            <CardContent className="bg-black p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> 
                        {location.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Empty cylinders: <span className="font-medium">{location.emptyCylinders}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(location.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>All storage and depot locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> 
                        {location.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">Full cylinders: <span className="font-medium">{location.fullCylinders}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(location.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <LocationEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        location={editLocation ? {
          id: editLocation.id,
          name: editLocation.name,
          address: editLocation.address,
          lat: editLocation.latitude,
          long: editLocation.longitude,
          type: editLocation.type || 'Customer',
          fullCylinders: editLocation.fullCylinders,
          emptyCylinders: editLocation.emptyCylinders,
          isWarehouse: editLocation.type === 'Storage'
        } : null}
        onSave={handleSaveLocation}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this location? 
              This action cannot be undone and the location will be removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Locations;
