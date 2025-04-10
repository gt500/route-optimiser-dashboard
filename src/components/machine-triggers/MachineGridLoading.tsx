
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const MachineGridLoading: React.FC = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="h-24 bg-muted rounded-t-lg"></CardHeader>
          <CardContent className="h-20 bg-muted/50 rounded-b-lg"></CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MachineGridLoading;
