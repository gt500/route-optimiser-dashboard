
import React from 'react';
import { MaintenanceItem } from '@/types/fleet';

interface UpcomingMaintenanceListProps {
  vehicles: any[];
  getUpcomingMaintenanceByVehicle: (vehicle: any) => string;
}

const UpcomingMaintenanceList: React.FC<UpcomingMaintenanceListProps> = ({ 
  vehicles, 
  getUpcomingMaintenanceByVehicle 
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Upcoming Maintenance</h2>
      <div className="space-y-2">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="border border-white/10 rounded-md p-2 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">
              {vehicle.name} ({vehicle.licensePlate || "No plate"})
            </span>
            <span className="text-sm text-amber-300">
              {getUpcomingMaintenanceByVehicle(vehicle)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMaintenanceList;
