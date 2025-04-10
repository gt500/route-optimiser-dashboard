
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useMachineData } from "@/components/machine-triggers/useMachineData";
import MachineGrid from "@/components/machine-triggers/MachineGrid";
import MachineAlertDialog from "@/components/machine-triggers/MachineAlertDialog";
import { MachineData } from "@/components/machine-triggers/types";

// Create a global object to store acknowledged alerts
// This is outside the component to persist across navigation
const globalAcknowledgedAlerts: Record<string, { time: string, user: string }> = {};

const MachineTriggers = () => {
  const [lowStockAlert, setLowStockAlert] = useState<MachineData | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, { time: string, user: string }>>(globalAcknowledgedAlerts);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const { data: machineData, isLoading, error } = useMachineData();

  // Check for low stock levels
  useEffect(() => {
    if (machineData) {
      const lowStockMachine = machineData.find(machine => 
        machine.cylinder_stock <= 7 && 
        !acknowledgedAlerts[`${machine.site_name}-${machine.terminal_id}`]
      );
      
      if (lowStockMachine && !isAlertOpen) {
        setLowStockAlert(lowStockMachine);
        setIsAlertOpen(true);
      }
    }
  }, [machineData, acknowledgedAlerts, isAlertOpen]);

  const handleAcknowledgeAlert = () => {
    if (lowStockAlert) {
      const key = `${lowStockAlert.site_name}-${lowStockAlert.terminal_id}`;
      const timestamp = new Date().toISOString();
      const user = "Current User"; // In a real app, get this from auth context
      
      // Update both the component state and the global object
      setAcknowledgedAlerts(prev => {
        const updated = {
          ...prev,
          [key]: { time: timestamp, user }
        };
        // Update global object
        Object.assign(globalAcknowledgedAlerts, updated);
        return updated;
      });
      
      toast({
        title: "Alert Acknowledged",
        description: `${lowStockAlert.site_name} low stock alert has been acknowledged at ${new Date().toLocaleTimeString()}`,
        variant: "destructive",
      });
      
      setIsAlertOpen(false);
      setLowStockAlert(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Machine Triggers</h1>
        <p className="text-muted-foreground">
          Monitor machine status and automation triggers for your fleet by country and region.
        </p>
      </div>

      <MachineGrid 
        machineData={machineData}
        isLoading={isLoading}
        error={error as Error | null}
        acknowledgedAlerts={acknowledgedAlerts}
      />

      <MachineAlertDialog
        isOpen={isAlertOpen}
        setIsOpen={setIsAlertOpen}
        machine={lowStockAlert}
        onAcknowledge={handleAcknowledgeAlert}
      />
    </div>
  );
};

export default MachineTriggers;
