
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Globe } from 'lucide-react';

interface RouteHeaderProps {
  onAddNewLocation: () => void;
  onOpenRegionSelection: () => void;
  onCreateNewRoute: () => void;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({ 
  onAddNewLocation, 
  onOpenRegionSelection, 
  onCreateNewRoute 
}) => {
  return (
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
  );
};

export default RouteHeader;
