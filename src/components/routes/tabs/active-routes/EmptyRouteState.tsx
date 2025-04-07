
import React from 'react';
import { Button } from '@/components/ui/button';
import { TruckIcon } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

interface EmptyRouteStateProps {
  onCreateRoute: () => void;
}

const EmptyRouteState = ({ onCreateRoute }: EmptyRouteStateProps) => {
  return (
    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="rounded-full bg-secondary p-4">
          <TruckIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">No active routes</h3>
        <p className="text-muted-foreground max-w-md">
          No routes are currently in progress. Create a new route and confirm a load to see it here.
        </p>
        <Button variant="outline" className="mt-2" onClick={onCreateRoute}>
          Create Route
        </Button>
      </div>
    </CardContent>
  );
};

export default EmptyRouteState;
