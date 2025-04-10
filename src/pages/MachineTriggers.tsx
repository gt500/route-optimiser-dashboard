
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useMachineData } from "@/components/machine-triggers/useMachineData";
import MachineGrid from "@/components/machine-triggers/MachineGrid";
import MachineAlertDialog from "@/components/machine-triggers/MachineAlertDialog";
import { MachineData } from "@/components/machine-triggers/types";

// Create a global object to store acknowledged alerts
// This is outside the component to persist across navigation
const globalAcknowledgedAlerts: Record<string, { time: string, user: string }> = {};

// Create a global function to check for low stock alerts
// This allows other components to trigger alerts
let globalCheckLowStock: ((forceCheck?: boolean) => void) | null = null;

const MachineTriggers = () => {
  const [lowStockAlert, setLowStockAlert] = useState<MachineData | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, { time: string, user: string }>>(globalAcknowledgedAlerts);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const { data: machineData, isLoading, error } = useMachineData();

  // Check for low stock levels
  const checkLowStock = (forceCheck = false) => {
    if (machineData) {
      const lowStockMachine = machineData.find(machine => 
        machine.cylinder_stock <= 7 && 
        !globalAcknowledgedAlerts[`${machine.site_name}-${machine.terminal_id}`]
      );
      
      if (lowStockMachine && (!isAlertOpen || forceCheck)) {
        setLowStockAlert(lowStockMachine);
        setIsAlertOpen(true);
      }
    }
  };

  // Assign the check function to the global variable
  useEffect(() => {
    globalCheckLowStock = checkLowStock;
    
    // Clean up
    return () => {
      globalCheckLowStock = null;
    };
  }, [machineData, isAlertOpen]);

  // Run the check whenever data changes
  useEffect(() => {
    checkLowStock();
  }, [machineData, acknowledgedAlerts]);

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

// Export the global check function to be used by other components
export const triggerLowStockCheck = () => {
  if (globalCheckLowStock) {
    globalCheckLowStock(true);
  }
};

export default MachineTriggers;
