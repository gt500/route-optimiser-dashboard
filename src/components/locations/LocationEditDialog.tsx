
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export type LocationType = {
  id: number | string;
  name: string;
  type: string;
  address: string;
  lat: number;
  long: number;
  fullCylinders?: number;
  emptyCylinders?: number;
  isWarehouse?: boolean;
};

interface LocationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationType | null;
  onSave: (location: LocationType) => void;
}

const LocationEditDialog = ({ open, onOpenChange, location, onSave }: LocationEditDialogProps) => {
  const [formData, setFormData] = useState<LocationType>({
    id: 0,
    name: '',
    type: 'Customer',
    address: '',
    lat: 0,
    long: 0,
    fullCylinders: 0,
    emptyCylinders: 0,
    isWarehouse: false
  });

  useEffect(() => {
    if (location) {
      setFormData({
        ...location,
        isWarehouse: location.type === 'Storage'
      });
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ 
      ...formData, 
      isWarehouse: checked,
      type: checked ? 'Storage' : 'Customer'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.address || !formData.lat || !formData.long) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave(formData);
    onOpenChange(false);
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
            
            <div>
              <Label htmlFor="type">Location Type</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Storage">Storage/Warehouse</SelectItem>
                  <SelectItem value="Distribution">Distribution Center</SelectItem>
                </SelectContent>
              </Select>
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
                  onChange={handleNumberChange}
                  placeholder="e.g. -33.9248"
                />
              </div>
              <div>
                <Label htmlFor="long">Longitude*</Label>
                <Input 
                  id="long" 
                  name="long" 
                  value={formData.long} 
                  onChange={handleNumberChange}
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
                    onChange={handleNumberChange}
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
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>
              </div>
            )}
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
