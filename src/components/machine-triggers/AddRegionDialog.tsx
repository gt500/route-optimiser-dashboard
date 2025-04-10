
import React, { useState, useEffect } from 'react';
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Reset the region name whenever the dialog opens with a new country
  useEffect(() => {
    if (open) {
      setRegionName('');
    }
  }, [open, country]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regionName.trim()) {
      toast({
        title: "Error",
        description: "Region name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Call parent component's add region function
      onAddRegion(country, regionName.trim());
      
      // Clear the input after submission
      setRegionName('');
    } catch (error) {
      console.error("Error adding region:", error);
      toast({
        title: "Error",
        description: "Failed to add region. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle cancel - make sure to clear the input
  const handleClose = () => {
    setRegionName('');
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            <Button type="button" variant="outline" onClick={handleClose}>
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
