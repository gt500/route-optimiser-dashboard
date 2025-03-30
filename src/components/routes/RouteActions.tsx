
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface RouteActionsProps {
  usingRealTimeData?: boolean;
  onSave?: () => void;
  onOptimize?: () => void;
}

const RouteActions: React.FC<RouteActionsProps> = ({ 
  usingRealTimeData,
  onSave,
  onOptimize
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onSave}>Save Route</Button>
      <Button className="gap-1" onClick={() => {
        if (onOptimize) {
          onOptimize();
        }
        
        toast.success(
          usingRealTimeData 
            ? "Route re-optimized with latest traffic data" 
            : "Route successfully optimized"
        );
      }}>
        <RotateCw className="h-4 w-4" />
        Re-optimize
      </Button>
    </div>
  );
};

export default RouteActions;
