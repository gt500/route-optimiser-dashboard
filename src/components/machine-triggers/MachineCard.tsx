
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineData } from "./types";

interface MachineCardProps {
  machine: MachineData;
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

const MachineCard = ({ machine, acknowledgedAlerts }: MachineCardProps) => {
  const isLowStock = machine.cylinder_stock <= 7;
  const alertKey = `${machine.site_name}-${machine.terminal_id}`;
  const isAcknowledged = acknowledgedAlerts[alertKey];

  return (
    <Card className={isLowStock ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {machine.terminal_id}
          {isLowStock && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
              Low Stock
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {machine.site_name}
          {machine.merchant_id && (
            <div className="mt-1">Merchant ID: {machine.merchant_id}</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cylinder Stock:</span>
            <span className={isLowStock ? "font-bold text-destructive" : ""}>
              {machine.cylinder_stock} units
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="text-sm">
              {new Date(machine.last_update).toLocaleString()}
            </span>
          </div>
          {isAcknowledged && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground border-t pt-2">
              <span>Acknowledged by: {isAcknowledged.user}</span>
              <span>{new Date(isAcknowledged.time).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineCard;
