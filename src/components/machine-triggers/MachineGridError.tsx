
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface MachineGridErrorProps {
  error: Error;
}

const MachineGridError: React.FC<MachineGridErrorProps> = ({ error }) => {
  return (
    <Card className="bg-destructive/10 border-destructive">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p>Failed to load machine data: {error.message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineGridError;
