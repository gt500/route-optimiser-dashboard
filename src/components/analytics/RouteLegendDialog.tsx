
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { routeLegendData } from './data/routeLegendData';

interface RouteLegendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RouteLegendDialog: React.FC<RouteLegendDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Route Legend</DialogTitle>
          <DialogDescription>
            Details about each route in the performance chart
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {routeLegendData.map((route) => (
            <div key={route.id} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: route.color }}
              ></div>
              <div>
                <p className="font-medium">{route.id}</p>
                <p className="text-sm text-muted-foreground">{route.name}</p>
                <p className="text-xs text-muted-foreground">{route.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteLegendDialog;
