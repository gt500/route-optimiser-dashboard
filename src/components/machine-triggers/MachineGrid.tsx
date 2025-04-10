
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import MachineCard from './MachineCard';
import { MachineData } from './types';
import { Toggle } from "@/components/ui/toggle";

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
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  
  // Filter machines with low stock if the filter is active
  const filteredMachines = React.useMemo(() => {
    if (!machineData) return [];
    return showLowStockOnly 
      ? machineData.filter(machine => machine.cylinder_stock <= 7)
      : machineData;
  }, [machineData, showLowStockOnly]);

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Toggle
          variant="outline"
          pressed={showLowStockOnly}
          onPressedChange={setShowLowStockOnly}
          className="flex items-center gap-2"
          aria-label="Show only machines with low stock"
        >
          <Package className="h-4 w-4" />
          <span>Low Stock Only</span>
        </Toggle>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.length > 0 ? (
          filteredMachines.map((machine, idx) => (
            <MachineCard 
              key={idx} 
              machine={machine} 
              acknowledgedAlerts={acknowledgedAlerts} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No machines match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineGrid;
