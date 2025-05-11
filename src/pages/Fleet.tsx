
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleEditDialog } from '@/components/fleet/VehicleEditDialog';
import { useFleetData } from '@/hooks/useFleetData';
import MaintenanceScheduleTable from '@/components/fleet/MaintenanceScheduleTable';
import FleetHeader from '@/components/fleet/FleetHeader';
import FleetOverviewContent from '@/components/fleet/overview/FleetOverviewContent';
import CostTables from '@/components/fleet/costs/CostTables';
import CostSummaryCard from '@/components/fleet/costs/CostSummaryCard';
import { useFleetMaintenanceHelper } from '@/hooks/fleet/useFleetMaintenanceHelper';
import { useFleetCostState } from '@/hooks/fleet/useFleetCostState';
import { useFleetVehicleEditor } from '@/hooks/fleet/useFleetVehicleEditor';

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
  
  // Custom hooks for managing Fleet page state
  const { fuelCost, handleFuelCostUpdate } = useFleetCostState();
  const { getUpcomingMaintenanceByVehicle } = useFleetMaintenanceHelper(maintenanceItems);
  const { 
    editingVehicle, 
    isDialogOpen, 
    handleEditVehicle, 
    handleSaveVehicle, 
    handleAddVehicle, 
    closeDialog 
  } = useFleetVehicleEditor(saveVehicle);

  // Calculate status counts for the status cards
  const statusCounts = {
    available: vehicles.filter(v => v.status === 'Available').length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6 animate-fade-in bg-black text-white">
      <FleetHeader 
        onAddVehicle={handleAddVehicle}
        onRefreshData={refreshData}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-black/50 border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FleetOverviewContent
            vehicles={vehicles}
            statusCounts={statusCounts}
            maintenanceItems={maintenanceItems}
            performanceMetrics={performanceMetrics}
            isLoading={isLoading}
            fuelCost={fuelCost}
            onFuelCostUpdate={handleFuelCostUpdate}
            onEditVehicle={handleEditVehicle}
            getUpcomingMaintenanceByVehicle={getUpcomingMaintenanceByVehicle}
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
        onClose={closeDialog}
        vehicle={editingVehicle}
        onSave={handleSaveVehicle}
      />
    </div>
  );
};

export default Fleet;
