
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStoredCountryRegions, saveCountryRegions } from '@/components/machine-triggers/utils/regionStorage';
import { toast } from 'sonner';

interface AddRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  onAddRegion: (region: string) => void;
}

const AddRegionDialog = ({ open, onOpenChange, country, onAddRegion }: AddRegionDialogProps) => {
  const [newRegion, setNewRegion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRegion.trim()) {
      toast.error("Please enter a region name");
      return;
    }
    
    const countryRegions = getStoredCountryRegions();
    const countryIndex = countryRegions.findIndex(cr => cr.country === country);
    
    if (countryIndex >= 0) {
      // Check if region already exists
      if (countryRegions[countryIndex].regions.includes(newRegion.trim())) {
        toast.error(`Region "${newRegion}" already exists for ${country}`);
        return;
      }
      
      // Add region to existing country
      countryRegions[countryIndex].regions.push(newRegion.trim());
    } else {
      // Add new country with region
      countryRegions.push({
        country,
        regions: [newRegion.trim()]
      });
    }
    
    // Save updated regions
    saveCountryRegions(countryRegions);
    
    // Notify parent component
    onAddRegion(newRegion);
    
    // Reset form and close dialog
    setNewRegion('');
    onOpenChange(false);
    
    toast.success(`Added "${newRegion}" to ${country} regions`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Region</DialogTitle>
          <DialogDescription>
            Add a new region for {country}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-region">Region Name</Label>
            <Input 
              id="new-region" 
              value={newRegion} 
              onChange={(e) => setNewRegion(e.target.value)}
              placeholder="Enter region name"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Region</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
