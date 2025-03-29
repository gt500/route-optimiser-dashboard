
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface LocationHeaderProps {
  onAddNew: () => void;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="text-muted-foreground">Manage your delivery and storage locations</p>
      </div>
      <Button onClick={onAddNew} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Location
      </Button>
    </div>
  );
};

export default LocationHeader;
