
import React from 'react';
import { format } from 'date-fns';
import { RefreshCw, XIcon } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DetailType = 'deliveries' | 'fuel' | 'route' | 'cylinders' | null;

interface DetailItem {
  id: string;
  name: string;
  date: string;
  rawDate: Date;
  distance: number;
  duration: number;
  cost: number;
  cylinders: number;
  status: string;
}

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailType: DetailType;
  detailTitle: string;
  detailData: DetailItem[];
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{detailTitle}</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Data from the last 7 days
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : detailData.length > 0 ? (
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4">
              {detailData.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {detailType === 'deliveries' || detailType === 'route' ? (
                        <div>
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="text-lg font-medium">{item.distance.toFixed(1)} km</p>
                        </div>
                      ) : null}
                      
                      {detailType === 'fuel' ? (
                        <div>
                          <p className="text-sm text-muted-foreground">Fuel Cost</p>
                          <p className="text-lg font-medium">R{item.cost.toFixed(2)}</p>
                        </div>
                      ) : null}
                      
                      {detailType === 'cylinders' ? (
                        <div>
                          <p className="text-sm text-muted-foreground">Cylinders</p>
                          <p className="text-lg font-medium">{item.cylinders}</p>
                        </div>
                      ) : null}
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-medium capitalize">{item.status.replace('_', ' ')}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-medium">{Math.round((item.duration || 0) / 60)} min</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-lg font-medium">R{item.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No data available for the last 7 days</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;
