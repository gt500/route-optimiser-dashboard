
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MachineData {
  site_name: string;
  machine_name: string;
  cylinder_stock: number;
  last_update: string;
}

const fetchMachineData = async (): Promise<MachineData[]> => {
  try {
    const response = await fetch('https://g2g-dashboard.aimrxd.com/version-test/api/1.1/obj/SITE_DATA');
    
    if (!response.ok) {
      throw new Error('Failed to fetch machine data');
    }
    
    const data = await response.json();
    return data.response.results.map((item: any) => ({
      site_name: item.site_name || 'Unknown Site',
      machine_name: item.machine_name || 'Unknown Machine',
      cylinder_stock: parseInt(item.cylinder_stock || '0', 10),
      last_update: item.last_update || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching machine data:', error);
    throw error;
  }
};

const MachineTriggers = () => {
  const [lowStockAlert, setLowStockAlert] = useState<MachineData | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, { time: string, user: string }>>({});
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const { data: machineData, isLoading, error } = useQuery({
    queryKey: ['machineData'],
    queryFn: fetchMachineData,
    refetchInterval: 60000, // Refetch every minute
  });

  // Check for low stock levels
  useEffect(() => {
    if (machineData) {
      const lowStockMachine = machineData.find(machine => 
        machine.cylinder_stock <= 7 && 
        !acknowledgedAlerts[`${machine.site_name}-${machine.machine_name}`]
      );
      
      if (lowStockMachine && !isAlertOpen) {
        setLowStockAlert(lowStockMachine);
        setIsAlertOpen(true);
      }
    }
  }, [machineData, acknowledgedAlerts, isAlertOpen]);

  const handleAcknowledgeAlert = () => {
    if (lowStockAlert) {
      const key = `${lowStockAlert.site_name}-${lowStockAlert.machine_name}`;
      const timestamp = new Date().toISOString();
      const user = "Current User"; // In a real app, get this from auth context
      
      setAcknowledgedAlerts(prev => ({
        ...prev,
        [key]: { time: timestamp, user }
      }));
      
      toast({
        title: "Alert Acknowledged",
        description: `${lowStockAlert.site_name} low stock alert has been acknowledged at ${new Date().toLocaleTimeString()}`,
      });
      
      setLowStockAlert(null);
      setIsAlertOpen(false);
    }
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
    setLowStockAlert(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Machine Triggers</h1>
        <p className="text-muted-foreground">
          Monitor machine status and automation triggers for your fleet.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted rounded-t-lg"></CardHeader>
              <CardContent className="h-20 bg-muted/50 rounded-b-lg"></CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p>Failed to load machine data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {machineData?.map((machine, idx) => (
            <Card key={idx} className={machine.cylinder_stock <= 7 ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {machine.machine_name}
                  {machine.cylinder_stock <= 7 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                      Low Stock
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{machine.site_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cylinder Stock:</span>
                    <span className={machine.cylinder_stock <= 7 ? "font-bold text-destructive" : ""}>
                      {machine.cylinder_stock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="text-sm">
                      {new Date(machine.last_update).toLocaleString()}
                    </span>
                  </div>
                  {acknowledgedAlerts[`${machine.site_name}-${machine.machine_name}`] && (
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground border-t pt-2">
                      <span>Acknowledged by: {acknowledgedAlerts[`${machine.site_name}-${machine.machine_name}`].user}</span>
                      <span>{new Date(acknowledgedAlerts[`${machine.site_name}-${machine.machine_name}`].time).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Low Stock Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={closeAlert}>
        <AlertDialogContent className="border-destructive animate-pulse">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Refill Required - Critical Stock Level
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 py-2">
                <div className="flex justify-between">
                  <strong>Site:</strong>
                  <span>{lowStockAlert?.site_name}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Machine:</strong>
                  <span>{lowStockAlert?.machine_name}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Cylinder Stock:</strong>
                  <span className="text-destructive font-bold">{lowStockAlert?.cylinder_stock} units</span>
                </div>
                <div className="flex justify-between">
                  <strong>Alert Time:</strong>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="bg-destructive/10 p-3 rounded-md text-center text-destructive font-medium">
                  Immediate action required. Stock is below threshold of 7 units.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={handleAcknowledgeAlert} className="w-full">
                <Check className="mr-2 h-4 w-4" />
                Acknowledge Alert
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MachineTriggers;
