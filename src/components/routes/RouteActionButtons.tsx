
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Globe, RotateCw, Check } from 'lucide-react';

interface RouteActionButtonsProps {
  onAddNewLocation: () => void;
  onOpenRegionSelection: () => void;
  onCreateNewRoute: () => void;
  onOptimize: () => void;
  onConfirmLoad: () => void;
  isLoadConfirmed: boolean;
  isOptimizeDisabled: boolean;
}

const RouteActionButtons: React.FC<RouteActionButtonsProps> = ({
  onAddNewLocation,
  onOpenRegionSelection,
  onCreateNewRoute,
  onOptimize,
  onConfirmLoad,
  isLoadConfirmed,
  isOptimizeDisabled
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="outline" onClick={onAddNewLocation}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Location
      </Button>

      <Button size="sm" variant="outline" onClick={onOpenRegionSelection}>
        <Globe className="mr-2 h-4 w-4" />
        Select Region
      </Button>

      <Button size="sm" variant="outline" onClick={onOptimize} disabled={isOptimizeDisabled}>
        <RotateCw className="mr-2 h-4 w-4" />
        Optimize
      </Button>

      <Button 
        size="sm" 
        onClick={onConfirmLoad} 
        disabled={isLoadConfirmed} 
        className={isLoadConfirmed ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isLoadConfirmed ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Load Confirmed
          </>
        ) : (
          'Confirm Load'
        )}
      </Button>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={onCreateNewRoute}
      >
        New Route
      </Button>
    </div>
  );
};

export default RouteActionButtons;
