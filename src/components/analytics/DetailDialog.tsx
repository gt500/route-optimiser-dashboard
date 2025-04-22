
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { RefreshCw, Calendar, Clock, Fuel, Package, TruckIcon, Route } from 'lucide-react';
import { format } from 'date-fns';

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailType: 'deliveries' | 'fuel' | 'route' | 'cylinders' | null;
  detailTitle: string;
  detailData: any[];
  isLoading: boolean;
}

const DetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onOpenChange,
  detailType,
  detailTitle,
  detailData,
  isLoading
}) => {
  // Format duration in a human-readable way (hours and minutes)
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  };
  
  const getIcon = () => {
    switch(detailType) {
      case 'deliveries':
        return <TruckIcon className="h-4 w-4" />;
      case 'fuel':
        return <Fuel className="h-4 w-4" />;
      case 'route':
        return <Route className="h-4 w-4" />;
      case 'cylinders':
        return <Package className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            <span>{detailTitle}</span>
          </DialogTitle>
          <DialogDescription>
            Data from the last 7 days
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : detailData.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No data available for the selected period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                {detailType === 'route' && (
                  <>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Cost</TableHead>
                  </>
                )}
                {detailType === 'fuel' && (
                  <>
                    <TableHead>Cost</TableHead>
                    <TableHead>Distance</TableHead>
                  </>
                )}
                {detailType === 'cylinders' && (
                  <>
                    <TableHead>Cylinders</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
                {detailType === 'deliveries' && (
                  <>
                    <TableHead>Status</TableHead>
                    <TableHead>Cylinders</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {item.date}
                    </div>
                  </TableCell>
                  
                  {detailType === 'route' && (
                    <>
                      <TableCell>{item.distance.toFixed(1)} km</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDuration(item.duration)}
                        </div>
                      </TableCell>
                      <TableCell>R{item.cost.toFixed(2)}</TableCell>
                    </>
                  )}
                  
                  {detailType === 'fuel' && (
                    <>
                      <TableCell>R{item.cost.toFixed(2)}</TableCell>
                      <TableCell>{item.distance.toFixed(1)} km</TableCell>
                    </>
                  )}
                  
                  {detailType === 'cylinders' && (
                    <>
                      <TableCell>{item.cylinders}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                    </>
                  )}
                  
                  {detailType === 'deliveries' && (
                    <>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.cylinders}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
