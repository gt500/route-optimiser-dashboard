
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Save, Printer, Mail, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { printData, emailData, exportToPDF } from '@/utils/exportUtils';
import { format } from 'date-fns';

interface RouteActionsProps {
  usingRealTimeData?: boolean;
  onSave?: () => void;
  onOptimize?: () => void;
  onRefreshTraffic?: () => void;
  disabled?: boolean;
  routeData?: {
    name: string;
    stops: Array<{
      siteName: string;
      cylinders: number;
      kms: number;
      fuelCost: number;
    }>;
    vehicleName?: string;
  };
}

const RouteActions: React.FC<RouteActionsProps> = ({ 
  usingRealTimeData,
  onSave,
  onOptimize,
  onRefreshTraffic,
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
        `Route Report: ${routeData.name}${routeData.vehicleName ? ` - ${routeData.vehicleName}` : ''}`,
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
        `Route Report: ${routeData.name}${routeData.vehicleName ? ` - ${routeData.vehicleName}` : ''}`,
        `Route Report - ${routeData.name} - ${today}`,
        new Date()
      );
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
      console.error(error);
    }
  };
  
  const handleDownloadPDF = () => {
    if (!routeData || !routeData.stops || routeData.stops.length === 0) {
      toast.error("No route data available to download");
      return;
    }
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      exportToPDF(
        routeData.stops,
        `${routeData.name}-${today}`,
        `Route Report: ${routeData.name}${routeData.vehicleName ? ` - ${routeData.vehicleName}` : ''}`,
        new Date()
      );
      toast.success("PDF download started");
    } catch (error) {
      toast.error("Failed to generate PDF");
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
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={disabled || !routeData.stops || routeData.stops.length === 0}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </>
      )}
      
      {usingRealTimeData && onRefreshTraffic && (
        <Button 
          variant="secondary" 
          onClick={() => {
            if (onRefreshTraffic) {
              onRefreshTraffic();
              toast.success("Traffic data refreshed");
            }
          }}
          disabled={disabled}
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Traffic
        </Button>
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
              ? "Route optimized with latest traffic data for maximum efficiency" 
              : "Route successfully optimized"
          );
        }}
        disabled={disabled}
      >
        <RotateCw className="h-4 w-4" />
        Optimize Route
      </Button>
    </div>
  );
};

export default RouteActions;
