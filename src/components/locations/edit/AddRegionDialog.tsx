
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRegions: string[];
  onRegionAdded: (region: string, country: string) => void;
  country?: string; // Add this prop
}

const AddRegionDialog: React.FC<AddRegionDialogProps> = ({
  open,
  onOpenChange,
  existingRegions,
  onRegionAdded,
  country = '' // Default to empty string
}) => {
  const [region, setRegion] = useState('');
  const [countryValue, setCountryValue] = useState(country);

  // Update the country field when the country prop changes
  React.useEffect(() => {
    setCountryValue(country);
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!region.trim()) {
      toast.error('Please enter a region name');
      return;
    }
    
    if (!countryValue.trim()) {
      toast.error('Please enter a country name');
      return;
    }
    
    if (existingRegions.includes(region.trim())) {
      toast.error(`Region "${region}" already exists`);
      return;
    }
    
    onRegionAdded(region.trim(), countryValue.trim());
    setRegion('');
    setCountryValue(country); // Reset to the provided country
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add New Region</DialogTitle>
          <DialogDescription>
            Create a new region for organizing locations
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              value={countryValue} 
              onChange={(e) => setCountryValue(e.target.value)}
              placeholder="Enter country name"
            />
          </div>
          <div>
            <Label htmlFor="region">Region Name</Label>
            <Input 
              id="region" 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Enter region name"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Region</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
