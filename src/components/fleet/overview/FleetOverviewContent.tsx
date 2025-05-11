
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleStatusCards from './VehicleStatusCards';
import OperationalParametersCard from './OperationalParametersCard';
import VehicleTable from './VehicleTable';
import UpcomingMaintenanceList from './UpcomingMaintenanceList';
import MetricsCards from './MetricsCards';

interface FleetOverviewContentProps {
  vehicles: any[];
  statusCounts: {
    available: number;
    onRoute: number;
    maintenance: number;
  };
  maintenanceItems: any[];
  performanceMetrics: any;
  isLoading: boolean;
  fuelCost: number;
  onFuelCostUpdate: (newCost: number) => void;
  onEditVehicle: (vehicle: any) => void;
  getUpcomingMaintenanceByVehicle: (vehicle: any) => string;
}

const FleetOverviewContent: React.FC<FleetOverviewContentProps> = ({
  vehicles,
  statusCounts,
  maintenanceItems,
  performanceMetrics,
  isLoading,
  fuelCost,
  onFuelCostUpdate,
  onEditVehicle,
  getUpcomingMaintenanceByVehicle
}) => {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <VehicleStatusCards statusCounts={statusCounts} />

      {/* Fuel Cost Editor */}
      <OperationalParametersCard 
        fuelCost={fuelCost} 
        onFuelCostUpdate={onFuelCostUpdate} 
      />

      {/* Vehicle Table */}
      <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Vehicle Fleet</CardTitle>
          <CardDescription className="text-white/60">Status and details of all vehicles</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-4 text-center text-white/60">Loading vehicle data...</div>
          ) : (
            <VehicleTable 
              vehicles={vehicles}
              isLoading={isLoading}
              onEditVehicle={onEditVehicle}
              getUpcomingMaintenanceByVehicle={getUpcomingMaintenanceByVehicle}
            />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Maintenance List */}
      <UpcomingMaintenanceList 
        vehicles={vehicles}
        getUpcomingMaintenanceByVehicle={getUpcomingMaintenanceByVehicle}
      />

      {/* Metrics Cards */}
      <MetricsCards 
        maintenanceItems={maintenanceItems} 
        performanceMetrics={performanceMetrics} 
      />
    </div>
  );
};

export default FleetOverviewContent;
