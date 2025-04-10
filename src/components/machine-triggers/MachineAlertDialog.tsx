
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";
import { MachineData } from "./types";

interface MachineAlertDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  machine: MachineData | null;
  onAcknowledge: () => void;
}

const MachineAlertDialog = ({ 
  isOpen, 
  setIsOpen, 
  machine, 
  onAcknowledge 
}: MachineAlertDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-destructive border-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Refill Required - Critical Stock Level
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 py-2">
            {machine && (
              <>
                <div className="flex justify-between">
                  <strong>Site:</strong>
                  <span>{machine.site_name}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Terminal ID:</strong>
                  <span>{machine.terminal_id}</span>
                </div>
                {machine.merchant_id && (
                  <div className="flex justify-between">
                    <strong>Merchant ID:</strong>
                    <span>{machine.merchant_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <strong>Cylinder Stock:</strong>
                  <span className="text-destructive font-bold">{machine.cylinder_stock} units</span>
                </div>
                <div className="flex justify-between">
                  <strong>Alert Time:</strong>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="bg-destructive/10 p-3 rounded-md text-center text-destructive font-medium">
                  Immediate action required. Stock is below threshold of 7 units.
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onAcknowledge} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Acknowledge Alert
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MachineAlertDialog;
