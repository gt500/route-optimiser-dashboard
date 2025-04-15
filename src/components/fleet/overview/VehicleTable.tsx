
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, CalendarDays, Clock, Tool, AlertTriangle } from 'lucide-react';
import { Vehicle } from '@/types/fleet';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';

interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onEditVehicle: (vehicle: Vehicle) => void;
  getUpcomingMaintenanceByVehicle: (vehicleId: string) => string;
}

const VehicleTable: React.FC<VehicleTableProps> = ({ 
  vehicles, 
  isLoading, 
  onEditVehicle,
  getUpcomingMaintenanceByVehicle
}) => {
  const calculateDaysInService = (startDate) => {
    if (!startDate) return 0;
    return differenceInDays(new Date(), parseISO(startDate));
  };

  // For better display of maintenance info
  const renderMaintenanceInfo = (vehicleId: string) => {
    const maintenanceInfo = getUpcomingMaintenanceByVehicle(vehicleId);
    
    // If it contains a date, extract and format it
    if (maintenanceInfo.includes(':')) {
      const [taskType, dateStr] = maintenanceInfo.split(': ');
      try {
        const date = parseISO(dateStr);
        const daysUntil = differenceInDays(date, new Date());
        
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Tool className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">{taskType}</span>
            </div>
            <div className="text-xs flex items-center gap-1 mt-0.5">
              <span>{format(date, 'MMM d, yyyy')}</span>
              {daysUntil < 14 && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 ml-1 px-1 py-0">
                  {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d`}
                </Badge>
              )}
            </div>
          </div>
        );
      } catch (e) {
        return maintenanceInfo;
      }
    }
    
    return maintenanceInfo;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="text-white">
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-white/80">ID</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Days in Service</TableHead>
            <TableHead>Load</TableHead>
            <TableHead>Fuel</TableHead>
            <TableHead>Last Service</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4 text-white/60">
                Loading vehicle data...
              </TableCell>
            </TableRow>
          ) : vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4 text-white/60">
                No vehicles found
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="transition-colors hover:bg-secondary/30">
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      vehicle.status === 'Available' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : vehicle.status === 'On Route'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {vehicle.startDate || '2025-04-16'}
                  </div>
                </TableCell>
                <TableCell>{vehicle.region}</TableCell>
                <TableCell>
                  {vehicle.startDate ? calculateDaysInService(vehicle.startDate) : '0'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(vehicle.load / vehicle.capacity) * 100} className="h-2 w-16" />
                    <span className="text-xs">{vehicle.load}/{vehicle.capacity}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={vehicle.fuelLevel} 
                      className="h-2 w-16"
                      style={{
                        background: vehicle.fuelLevel < 30 ? 'rgba(239, 68, 68, 0.2)' : undefined,
                      }}
                    />
                    <span className="text-xs">{vehicle.fuelLevel}%</span>
                  </div>
                </TableCell>
                <TableCell>{vehicle.lastService}</TableCell>
                <TableCell>
                  {renderMaintenanceInfo(vehicle.id)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEditVehicle(vehicle)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehicleTable;
