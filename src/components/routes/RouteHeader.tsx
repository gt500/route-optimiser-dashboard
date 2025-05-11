
import React from 'react';
import RouteHeaderTitle from './RouteHeaderTitle';
import RouteActionButtons from './RouteActionButtons';

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
    <div className="flex items-center justify-between">
      <RouteHeaderTitle />
      <RouteActionButtons 
        onAddNewLocation={onAddNewLocation}
        onOpenRegionSelection={onOpenRegionSelection}
        onCreateNewRoute={onCreateNewRoute}
        onOptimize={onOptimize}
        onConfirmLoad={onConfirmLoad}
        isLoadConfirmed={isLoadConfirmed}
        isOptimizeDisabled={isOptimizeDisabled}
      />
    </div>
  );
};

export default RouteHeader;
