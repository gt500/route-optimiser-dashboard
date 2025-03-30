
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TruckIcon } from 'lucide-react';

const ActiveRoutesTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Routes</CardTitle>
        <CardDescription>
          Currently active delivery routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="rounded-full bg-secondary p-4">
            <TruckIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No active routes</h3>
          <p className="text-muted-foreground max-w-md">
            No routes are currently in progress. Create a new route and dispatch it to see it here.
          </p>
          <Button variant="outline" className="mt-2" onClick={onCreateRoute}>
            Create Route
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveRoutesTab;
