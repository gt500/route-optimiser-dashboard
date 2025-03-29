
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

export interface LocationInfo {
  id: string | number;
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

const demoLocations: LocationInfo[] = [
  { id: 1, name: 'Afrox Epping Depot', address: 'Epping Industria, Cape Town', latitude: -33.93631, longitude: 18.52759, type: 'Storage', fullCylinders: 100, emptyCylinders: 0 },
  { id: 2, name: 'Birkenhead Shopping Centre', address: 'Birkenhead, Western Cape', latitude: -33.731659, longitude: 18.443239, type: 'Customer', fullCylinders: 0, emptyCylinders: 15 },
  { id: 3, name: 'Food Lovers Sunningdale', address: 'Sunningdale, KwaZulu-Natal', latitude: -29.7486, longitude: 31.0462, type: 'Customer', fullCylinders: 0, emptyCylinders: 8 },
  { id: 4, name: 'Haasendaal Gables', address: 'Haasendaal, Western Cape', latitude: -33.907776, longitude: 18.698757, type: 'Customer', fullCylinders: 0, emptyCylinders: 23 },
  { id: 5, name: 'Pick n Pay TableView', address: 'Table View, Cape Town', latitude: -33.8258, longitude: 18.4881, type: 'Customer', fullCylinders: 0, emptyCylinders: 18 },
  { id: 15, name: 'Shell Sea Point', address: 'Sea Point, Cape Town', latitude: -33.4812, longitude: 18.3855, type: 'Storage', fullCylinders: 75, emptyCylinders: 0 },
];

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<LocationInfo[]>(demoLocations);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editLocation, setEditLocation] = useState<LocationInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
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
          const mappedLocations = data.map(item => ({
            id: item.id,
            name: item.name,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            type: item.type || 'Customer',
            fullCylinders: item.type === 'Storage' ? 75 : 0,
            emptyCylinders: item.type === 'Customer' ? 15 : 0,
            open_time: item.open_time || '08:00',
            close_time: item.close_time || '17:00'
          }));
          
          setLocations(mappedLocations);
        }
      } catch (error) {
        console.error('Error in fetchLocations:', error);
        toast.error('Failed to fetch locations');
      } finally {
        setIsSyncing(false);
      }
    };

    fetchLocations();
  }, []);
  
  const handleEdit = (location: LocationInfo) => {
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveLocation = async (location: LocationInfo) => {
    try {
      if (location.id) {
        // It's an edit
        const { error } = await supabase
          .from('locations')
          .update({
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            open_time: location.open_time || '08:00',
            close_time: location.close_time || '17:00'
          })
          .eq('id', location.id);
        
        if (error) throw error;
        
        setLocations(prev => 
          prev.map(loc => loc.id === location.id ? location : loc)
        );
        toast.success(`Location "${location.name}" updated`);
      } else {
        // It's a new location
        const newLocationId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('locations')
          .insert({
            id: newLocationId,
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
            open_time: location.open_time || '08:00',
            close_time: location.close_time || '17:00'
          });
        
        if (error) throw error;
        
        const newLocation = {
          ...location,
          id: newLocationId
        };
        
        setLocations(prev => [...prev, newLocation]);
        toast.success(`Location "${location.name}" created`);
      }
      
      setIsEditDialogOpen(false);
      setEditLocation(null);
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };
  
  const handleDelete = async (id: string | number) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLocations(prev => prev.filter(location => location.id !== id));
      toast.success('Location deleted');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
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
          <TabsTrigger value="all">All Locations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
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
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)}>
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.map((location) => (
                  // Customer location cards
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
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Button>
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
                  // Storage location cards
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
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Button>
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
        location={editLocation}
        onSave={handleSaveLocation}
      />
    </div>
  );
};

export default Locations;
