import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TruckIcon, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleEditDialog } from '@/components/fleet/VehicleEditDialog';
import { useFleetData } from '@/hooks/useFleetData';
import MaintenanceScheduleTable from '@/components/fleet/MaintenanceScheduleTable';

import VehicleStatusCards from '@/components/fleet/overview/VehicleStatusCards';
import VehicleTable from '@/components/fleet/overview/VehicleTable';
import MetricsCards from '@/components/fleet/overview/MetricsCards';
import CostTables from '@/components/fleet/costs/CostTables';
import CostSummaryCard from '@/components/fleet/costs/CostSummaryCard';

const variableCosts = [
  { type: '15inch Tyres', description: '4 Tyres', cost: 2115, notes: 'lasts 4-5 months' },
  { type: 'Minor Services', description: 'Every 15 000km @ R5000', cost: 1667 },
  { type: 'Major Service', description: 'Every 45 000km', cost: 1250 },
  { type: 'Diesel per month', description: '320km x 22 days x R2,20', cost: 15488, notes: '7040 per month' },
  { type: 'Miscellaneous', description: 'Car wash etc.', cost: 800 },
];

const costSummary = {
  variableTotal: 21320,
  fixedTotal: 31244,
  monthlyTotal: 52564,
  twoVehiclesTotal: 105127.33,
  costPerKm: 7.46,
  costPerKgLPG: 0.83
};

const Fleet = () => {
  const { 
    vehicles, 
    maintenanceItems, 
    performanceMetrics, 
    isLoading, 
    saveVehicle, 
    refreshData,
    fixedCosts,
    monthlyTasks,
    quarterlyTasks,
    budgetSummary,
    sampleTimeline
  } = useFleetData();
  
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statusCounts = {
    available: vehicles.filter(v => v.status === 'Available').length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleSaveVehicle = (updatedVehicle) => {
    saveVehicle(updatedVehicle).then(() => {
      setIsDialogOpen(false);
      setEditingVehicle(null);
    });
  };

  const handleAddVehicle = () => {
    setEditingVehicle({
      id: '',
      name: 'Medium Duty Truck', // Changed from 'Leyland Phoenix' to 'Medium Duty Truck'
      licensePlate: '',
      status: 'Available',
      capacity: 80,
      load: 0,
      fuelLevel: 100,
      location: '',
      lastService: new Date().toISOString().split('T')[0],
      country: 'South Africa',
      region: '',
      startDate: '2025-04-16'
    });
    setIsDialogOpen(true);
  };

  const getUpcomingMaintenanceByVehicle = (vehicle) => {
    const startDate = "2025-04-15";
    const vehicleMaintenance = maintenanceItems
      .filter(item => item.vehicleId === vehicle.id && item.date >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (vehicleMaintenance.length === 0) return "No upcoming maintenance";
    return `${vehicleMaintenance[0].type}: ${vehicleMaintenance[0].date}`;
  };

  return (
    <div className="space-y-6 animate-fade-in bg-black text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Monitor and manage delivery vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} size="icon" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddVehicle} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-black/50 border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Status Cards */}
          <VehicleStatusCards statusCounts={statusCounts} />

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
                  onEditVehicle={handleEditVehicle}
                  getUpcomingMaintenanceByVehicle={getUpcomingMaintenanceByVehicle}
                />
              )}
            </CardContent>
          </Card>

          {/* New: List of upcoming maintenance for each vehicle based on start date */}
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

          {/* Metrics Cards */}
          <MetricsCards 
            maintenanceItems={maintenanceItems} 
            performanceMetrics={performanceMetrics} 
          />
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-6">
          <MaintenanceScheduleTable 
            maintenanceItems={maintenanceItems}
            monthlyTasks={monthlyTasks}
            quarterlyTasks={quarterlyTasks}
            fixedCosts={fixedCosts}
            budgetSummary={budgetSummary}
            sampleTimeline={sampleTimeline}
          />
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-6">
          {/* Cost Tables */}
          <CostTables 
            variableCosts={variableCosts}
            fixedCosts={fixedCosts}
            costSummary={costSummary}
          />
          
          {/* Cost Summary */}
          <CostSummaryCard costSummary={costSummary} />
        </TabsContent>
      </Tabs>
      
      <VehicleEditDialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        onSave={handleSaveVehicle}
      />
    </div>
  );
};

export default Fleet;
