
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const RouteHistoryTab = ({ onCreateRoute }: { onCreateRoute: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route History</CardTitle>
        <CardDescription>
          Previously completed routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="rounded-full bg-secondary p-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No route history</h3>
          <p className="text-muted-foreground max-w-md">
            Your completed routes will appear here. You haven't completed any routes yet.
          </p>
          <Button variant="outline" className="mt-2" onClick={onCreateRoute}>
            Create Route
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteHistoryTab;
