
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface FleetHeaderProps {
  onAddVehicle: () => void;
  onRefreshData: () => void;
}

const FleetHeader: React.FC<FleetHeaderProps> = ({ onAddVehicle, onRefreshData }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-muted-foreground">Monitor and manage delivery vehicles</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefreshData} size="icon" variant="outline">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={onAddVehicle} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
    </div>
  );
};

export default FleetHeader;
