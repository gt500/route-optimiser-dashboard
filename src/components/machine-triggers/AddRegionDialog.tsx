
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddRegionDialogProps {
  open: boolean;
  country: string;
  onClose: () => void;
  onAddRegion: (country: string, region: string) => void;
}

const AddRegionDialog = ({
  open,
  country,
  onClose,
  onAddRegion
}: AddRegionDialogProps) => {
  const [regionName, setRegionName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regionName.trim()) {
      onAddRegion(country, regionName.trim());
      setRegionName('');
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Region to {country}</DialogTitle>
          <DialogDescription>
            Enter the name of the new region to add under {country}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              placeholder="Region name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!regionName.trim()}>
              Add Region
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
