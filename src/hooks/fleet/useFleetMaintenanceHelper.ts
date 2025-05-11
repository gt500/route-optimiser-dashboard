
import { useState } from 'react';
import { MaintenanceItem } from '@/types/fleet';

export const useFleetMaintenanceHelper = (maintenanceItems: MaintenanceItem[]) => {
  // Get upcoming maintenance for a specific vehicle
  const getUpcomingMaintenanceByVehicle = (vehicle) => {
    const startDate = "2025-04-15";
    const vehicleMaintenance = maintenanceItems
      .filter(item => item.vehicleId === vehicle.id && item.date >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (vehicleMaintenance.length === 0) return "No upcoming maintenance";
    return `${vehicleMaintenance[0].type}: ${vehicleMaintenance[0].date}`;
  };

  return {
    getUpcomingMaintenanceByVehicle
  };
};
