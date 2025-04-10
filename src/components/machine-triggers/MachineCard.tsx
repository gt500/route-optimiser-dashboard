
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock, Package } from "lucide-react";
import { MachineData } from './types';

interface MachineCardProps {
  machine: MachineData;
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

const MachineCard = ({ machine, acknowledgedAlerts }: MachineCardProps) => {
  const { site_name, machine_name, cylinder_stock, last_update, country, region } = machine;

  // Format the last update time
  const formatLastUpdate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Unknown';
    }
  };

  // Check if this machine has low stock
  const hasLowStock = cylinder_stock <= 7;
  
  // Check if alert has been acknowledged
  const alertKey = `${site_name}-${machine.terminal_id}`;
  const isAcknowledged = acknowledgedAlerts[alertKey];
  
  // Get relevant CSS classes based on stock level
  const getStockLevelClasses = () => {
    if (cylinder_stock <= 3) {
      return "text-red-500 font-bold";
    } else if (cylinder_stock <= 7) {
      return "text-amber-500 font-bold";
    } else {
      return "text-green-500";
    }
  };
  
  return (
    <Card className={hasLowStock ? (isAcknowledged ? "border-amber-300" : "border-red-500") : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{site_name}</span>
          {hasLowStock && !isAcknowledged && (
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 ml-2" />
          )}
        </CardTitle>
        <CardDescription className="flex flex-col">
          <span>{machine_name}</span>
          <span className="text-xs text-muted-foreground">
            {country}{region ? ` - ${region}` : ''}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Stock Level:</span>
            </div>
            <span className={getStockLevelClasses()}>
              {cylinder_stock} cylinders
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Last Updated:</span>
            </div>
            <span className="text-muted-foreground">
              {formatLastUpdate(last_update)}
            </span>
          </div>
          
          {isAcknowledged && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Alert acknowledged by {isAcknowledged.user}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineCard;
