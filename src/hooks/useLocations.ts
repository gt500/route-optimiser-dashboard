
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationInfo, LocationType, SupabaseLocation } from '@/types/location';

export const useLocations = () => {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editLocation, setEditLocation] = useState<LocationInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
          let locationType = item.type || 'Customer';
          
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
  
  const handleSaveLocation = async (location: LocationType) => {
    console.log('Saving location:', location);
    try {
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
      
      setIsEditDialogOpen(false);
      setEditLocation(null);
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

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    filteredLocations,
    isSyncing,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    editLocation,
    isEditDialogOpen,
    setIsEditDialogOpen,
    locationToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleSaveLocation,
    openDeleteConfirmation,
    handleDelete,
    handleAddNew
  };
};
