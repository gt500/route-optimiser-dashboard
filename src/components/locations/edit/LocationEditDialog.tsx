
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LocationType } from '@/types/location';

import BasicInfoFields from './BasicInfoFields';
import CoordinateFields from './CoordinateFields';
import HoursFields from './HoursFields';
import InventoryFields from './InventoryFields';

interface LocationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationType | null;
  onSave: (location: LocationType) => void;
}

const LocationEditDialog = ({ open, onOpenChange, location, onSave }: LocationEditDialogProps) => {
  const [formData, setFormData] = useState<LocationType>({
    id: '',
    name: '',
    type: 'Customer',
    address: '',
    lat: 0,
    long: 0,
    fullCylinders: 0,
    emptyCylinders: 0,
    isWarehouse: false,
    open_time: '08:00',
    close_time: '17:00'
  });

  useEffect(() => {
    if (location) {
      console.log('Editing location:', location);
      setFormData({
        ...location,
        isWarehouse: location.type === 'Storage'
      });
    } else {
      // Reset to defaults for new location
      setFormData({
        id: '',
        name: '',
        type: 'Customer',
        address: '',
        lat: 0,
        long: 0,
        fullCylinders: 0,
        emptyCylinders: 0,
        isWarehouse: false,
        open_time: '08:00',
        close_time: '17:00'
      });
    }
  }, [location, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow negative numbers for coordinates
    const numValue = parseFloat(value);
    setFormData({ ...formData, [name]: isNaN(numValue) ? 0 : numValue });
  };

  const handleTypeChange = (value: string) => {
    const isWarehouse = value === 'Storage';
    setFormData({ 
      ...formData, 
      type: value,
      isWarehouse: isWarehouse
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Log the form data to verify the coordinates are correct
    console.log('Form data to be saved:', formData);
    
    // Use a copy to prevent any reference issues
    const locationToSave = {...formData};
    onSave(locationToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{location ? 'Edit' : 'Add'} Location</DialogTitle>
          <DialogDescription>
            {location ? 'Update the location details' : 'Enter details for the new location'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <BasicInfoFields 
              formData={formData} 
              handleChange={handleChange} 
              handleTypeChange={handleTypeChange} 
            />
            
            <CoordinateFields 
              formData={formData} 
              handleNumberChange={handleNumberChange} 
            />
            
            <HoursFields 
              formData={formData} 
              handleChange={handleChange} 
            />
            
            <InventoryFields 
              formData={formData} 
              handleNumberChange={handleNumberChange} 
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationEditDialog;
