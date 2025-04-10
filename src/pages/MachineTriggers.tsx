
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useMachineData } from "@/components/machine-triggers/useMachineData";
import MachineGrid from "@/components/machine-triggers/MachineGrid";
import MachineAlertDialog from "@/components/machine-triggers/MachineAlertDialog";
import { MachineData } from "@/components/machine-triggers/types";
import { setGlobalAlertStatus } from "@/components/notifications/AlertIndicator";

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

  const { data: machineData, isLoading, error, refetch } = useMachineData();
  
  // Periodically refetch data
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refetch every 30 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);

  // Check for low stock levels
  const checkLowStock = useCallback((forceCheck = false) => {
    if (machineData) {
      const lowStockMachine = machineData.find(machine => 
        machine.cylinder_stock <= 7 && 
        !globalAcknowledgedAlerts[`${machine.site_name}-${machine.terminal_id}`]
      );
      
      // Update global alert status based on whether there's a low stock machine
      setGlobalAlertStatus(!!lowStockMachine);
      
      if (lowStockMachine && (!isAlertOpen || forceCheck)) {
        setLowStockAlert(lowStockMachine);
        setIsAlertOpen(true);
        
        // Also show a toast notification
        toast({
          title: "Low Stock Alert",
          description: `${lowStockMachine.site_name} has low cylinder stock (${lowStockMachine.cylinder_stock})`,
          variant: "destructive",
        });
      }
    }
  }, [machineData, isAlertOpen, toast]);

  // Assign the check function to the global variable
  useEffect(() => {
    globalCheckLowStock = checkLowStock;
    
    // Clean up
    return () => {
      globalCheckLowStock = null;
    };
  }, [checkLowStock]);

  // Run the check whenever data changes
  useEffect(() => {
    if (machineData) {
      console.log("Checking for low stock with data:", machineData.length);
      checkLowStock();
    }
  }, [machineData, checkLowStock]);

  const handleAcknowledgeAlert = () => {
    if (lowStockAlert) {
      const key = `${lowStockAlert.site_name}-${lowStockAlert.terminal_id}`;
      const timestamp = new Date().toISOString();
      const user = "Current User"; // In a real app, get this from auth context
      
      // Update both the component state and the global object
      const updatedAlerts = {
        ...acknowledgedAlerts,
        [key]: { time: timestamp, user }
      };
      
      // Update local state
      setAcknowledgedAlerts(updatedAlerts);
      
      // Update global object for persistence across navigation
      Object.assign(globalAcknowledgedAlerts, updatedAlerts);
      
      toast({
        title: "Alert Acknowledged",
        description: `${lowStockAlert.site_name} low stock alert has been acknowledged`,
      });
      
      setIsAlertOpen(false);
      setLowStockAlert(null);
      
      // Also update global alert status if all alerts have been acknowledged
      if (!machineData?.find(machine => 
        machine.cylinder_stock <= 7 && 
        !updatedAlerts[`${machine.site_name}-${machine.terminal_id}`])) {
        setGlobalAlertStatus(false);
      }
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
