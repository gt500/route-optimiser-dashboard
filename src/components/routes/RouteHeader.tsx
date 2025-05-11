
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Globe, Route, Check } from 'lucide-react';

interface RouteHeaderProps {
  onAddNewLocation: () => void;
  onOpenRegionSelection: () => void;
  onCreateNewRoute: () => void;
  onOptimize: () => void;
  onConfirmLoad: () => void;
  isLoadConfirmed: boolean;
  isOptimizeDisabled: boolean;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({ 
  onAddNewLocation, 
  onOpenRegionSelection, 
  onCreateNewRoute,
  onOptimize,
  onConfirmLoad,
  isLoadConfirmed,
  isOptimizeDisabled
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/0b09ba82-e3f0-4fa1-ab8d-87f06fd9f31b.png" 
            alt="GAZ2GO" 
            className="h-12 w-auto" 
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Route Optimiser</h1>
            <p className="text-muted-foreground">Create and manage delivery routes in South Africa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={onAddNewLocation}>
            <MapPin className="h-4 w-4" />
            New Location
          </Button>
          <Button variant="outline" className="gap-2" onClick={onOpenRegionSelection}>
            <Globe className="h-4 w-4" />
            Change Region
          </Button>
          <Button className="gap-1" onClick={onCreateNewRoute}>
            <Plus className="h-4 w-4" />
            New Route
          </Button>
        </div>
      </div>
      
      {/* Action buttons below the header */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="default"
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={onOptimize}
          disabled={isOptimizeDisabled}
        >
          <Route className="h-4 w-4" />
          Optimize Route
        </Button>
        
        <Button
          variant={isLoadConfirmed ? "secondary" : "default"}
          className={isLoadConfirmed ? "" : "bg-blue-600 hover:bg-blue-700"}
          onClick={onConfirmLoad}
          disabled={isLoadConfirmed}
        >
          {isLoadConfirmed && <Check className="h-4 w-4" />}
          {isLoadConfirmed ? "Load Confirmed" : "Confirm Load"}
        </Button>
      </div>
    </div>
  );
};

export default RouteHeader;
