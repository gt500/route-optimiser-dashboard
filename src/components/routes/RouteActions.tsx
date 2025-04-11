
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Save, Printer, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { printData, emailData } from '@/utils/exportUtils';
import { format } from 'date-fns';

interface RouteActionsProps {
  usingRealTimeData?: boolean;
  onSave?: () => void;
  onOptimize?: () => void;
  disabled?: boolean;
  routeData?: {
    name: string;
    stops: Array<{
      siteName: string;
      cylinders: number;
      kms: number;
      fuelCost: number;
    }>;
  };
}

const RouteActions: React.FC<RouteActionsProps> = ({ 
  usingRealTimeData,
  onSave,
  onOptimize,
  disabled = false,
  routeData
}) => {
  const handlePrint = () => {
    if (!routeData || !routeData.stops || routeData.stops.length === 0) {
      toast.error("No route data available to print");
      return;
    }
    
    try {
      printData(
        routeData.stops,
        `Route Report: ${routeData.name}`,
        new Date()
      );
      toast.success("Print view opened in new window");
    } catch (error) {
      toast.error("Failed to generate print view");
      console.error(error);
    }
  };
  
  const handleEmail = () => {
    if (!routeData || !routeData.stops || routeData.stops.length === 0) {
      toast.error("No route data available to email");
      return;
    }
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      emailData(
        routeData.stops,
        `Route Report: ${routeData.name}`,
        `Route Report - ${routeData.name} - ${today}`,
        new Date()
      );
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
      console.error(error);
    }
  };
  
  return (
    <div className="flex justify-end gap-2">
      {routeData && (
        <>
          <Button 
            variant="print" 
            onClick={handlePrint}
            disabled={disabled || !routeData.stops || routeData.stops.length === 0}
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="email" 
            onClick={handleEmail}
            disabled={disabled || !routeData.stops || routeData.stops.length === 0}
            className="gap-1"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </>
      )}
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
