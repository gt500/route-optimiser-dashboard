
import React, { useMemo } from 'react';
import { MachineData } from './types';
import MachineGridLoading from './MachineGridLoading';
import MachineGridError from './MachineGridError';
import MachineFilterControls from './MachineFilterControls';
import MachineList from './MachineList';
import AddRegionDialog from './AddRegionDialog';
import { useMachineFilters } from './hooks/useMachineFilters';
import { useRegionManagement } from './hooks/useRegionManagement';

interface MachineGridProps {
  machineData: MachineData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

const MachineGrid = ({ 
  machineData, 
  isLoading, 
  error, 
  acknowledgedAlerts 
}: MachineGridProps) => {
  // Use the region management hook
  const {
    countryRegions,
    isAddRegionOpen,
    selectedCountryForRegion,
    handleAddRegionClick,
    handleAddRegion,
    handleCloseRegionDialog
  } = useRegionManagement();
  
  // Set all current machines to Western Cape region if no region specified
  const processedMachineData = useMemo(() => {
    if (!machineData) return [];
    
    return machineData.map(machine => ({
      ...machine,
      country: machine.country || "South Africa",
      region: machine.region || "Western Cape"
    }));
  }, [machineData]);
  
  // Use the machine filtering hook
  const {
    showLowStockOnly,
    setShowLowStockOnly,
    selectedCountry,
    selectedRegion,
    filteredMachines,
    handleSelectCountryRegion
  } = useMachineFilters(processedMachineData);

  if (isLoading) {
    return <MachineGridLoading />;
  }

  if (error) {
    return <MachineGridError error={error} />;
  }

  return (
    <div className="space-y-4">
      <MachineFilterControls 
        showLowStockOnly={showLowStockOnly}
        setShowLowStockOnly={setShowLowStockOnly}
        selectedCountry={selectedCountry}
        selectedRegion={selectedRegion}
        onSelectCountryRegion={handleSelectCountryRegion}
        countryRegions={countryRegions}
        onAddRegion={handleAddRegionClick}
      />
      
      <MachineList 
        machines={filteredMachines}
        acknowledgedAlerts={acknowledgedAlerts}
      />
      
      <AddRegionDialog
        open={isAddRegionOpen}
        country={selectedCountryForRegion}
        onClose={handleCloseRegionDialog}
        onAddRegion={handleAddRegion}
      />
    </div>
  );
};

export default MachineGrid;
