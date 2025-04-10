
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import MachineCard from './MachineCard';
import { MachineData } from './types';

interface MachineGridProps {
  machineData: MachineData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

const MachineGrid = ({ 
  machineData, 
  isLoading, 
  error, 
  acknowledgedAlerts 
}: MachineGridProps) => {
  if (isLoading) {
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
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p>Failed to load machine data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {machineData?.map((machine, idx) => (
        <MachineCard 
          key={idx} 
          machine={machine} 
          acknowledgedAlerts={acknowledgedAlerts} 
        />
      ))}
    </div>
  );
};

export default MachineGrid;
