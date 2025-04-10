
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Reset the region name whenever the dialog opens with a new country
  useEffect(() => {
    if (open) {
      setRegionName('');
      setIsSubmitting(false);
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
      setIsSubmitting(true);
      
      // Call parent component's add region function
      onAddRegion(country, regionName.trim());
      
      // Show success toast
      toast({
        title: "Success",
        description: `Added ${regionName.trim()} to ${country}`,
      });
      
      // Clear the input and reset submission state
      setRegionName('');
      setIsSubmitting(false);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error adding region:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to add region. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
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
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!regionName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Region'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
