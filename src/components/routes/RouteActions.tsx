
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RouteActionsProps {
  usingRealTimeData?: boolean;
  onSave?: () => void;
  onOptimize?: () => void;
  disabled?: boolean;
}

const RouteActions: React.FC<RouteActionsProps> = ({ 
  usingRealTimeData,
  onSave,
  onOptimize,
  disabled = false
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={() => {
          if (onSave) {
            onSave();
            toast.success("Route saved successfully");
          }
        }}
        disabled={disabled}
        className="gap-1"
      >
        <Save className="h-4 w-4" />
        Save Route
      </Button>
      <Button 
        className="gap-1" 
        onClick={() => {
          if (onOptimize) {
            onOptimize();
          }
          
          toast.success(
            usingRealTimeData 
              ? "Route re-optimized with latest traffic data" 
              : "Route successfully optimized"
          );
        }}
        disabled={disabled}
      >
        <RotateCw className="h-4 w-4" />
        Re-optimize
      </Button>
    </div>
  );
};

export default RouteActions;
