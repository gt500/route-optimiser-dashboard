
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud, Truck, MapPin, Zap, Clock } from 'lucide-react';

interface RouteStopData {
  siteName: string;
  cylinders: number;
  kms?: number;
  fuelCost?: number;
}

interface RouteData {
  name: string;
  stops: RouteStopData[];
}

interface RouteActionsProps {
  onSave: () => void;
  onOptimize: () => void;
  usingRealTimeData?: boolean;
  disabled?: boolean;
  routeData?: RouteData;
}

const RouteActions: React.FC<RouteActionsProps> = ({ 
  onSave, 
  onOptimize, 
  usingRealTimeData = false, 
  disabled = false,
  routeData
}) => {
  return (
    <div className="flex items-center gap-2">
      {usingRealTimeData && (
        <div className="flex items-center bg-green-500/20 text-green-500 text-xs px-3 py-1 rounded-full">
          <Clock className="h-3 w-3 mr-1" />
          <span>Live data</span>
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1" 
        onClick={onOptimize}
        disabled={disabled}
      >
        <Zap className="h-4 w-4" /> 
        Optimize
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        className="gap-1"
        onClick={onSave}
        disabled={disabled}
      >
        <DownloadCloud className="h-4 w-4" /> 
        Save Route
      </Button>
    </div>
  );
};

export default RouteActions;
