
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Clock, 
  Fuel, 
  MapPin, 
  Package, 
  TruckIcon, 
  Route, 
  RefreshCw, 
  FileText, 
  Download,
  FileSpreadsheet,
  FileText as FilePdfIcon 
} from 'lucide-react';

interface RouteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  routeColor: string;
}

const RouteDetailDialog: React.FC<RouteDetailDialogProps> = ({
  open,
  onOpenChange,
  routeId,
  routeName,
  routeColor
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Route Details: {routeName}</DialogTitle>
          <DialogDescription>
            Viewing details for route {routeId}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          Route analytics content would go here
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailDialog;
