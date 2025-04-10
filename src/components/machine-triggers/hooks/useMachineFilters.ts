
import { useState, useMemo, useCallback } from 'react';
import { MachineData } from '../types';

export const useMachineFilters = (processedMachineData: MachineData[]) => {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Filter machines by low stock and selected region
  const filteredMachines = useMemo(() => {
    if (!processedMachineData.length) return [];
    
    return processedMachineData.filter(machine => {
      // Filter by stock level
      const passesStockFilter = !showLowStockOnly || machine.cylinder_stock <= 7;
      
      // Filter by region
      const passesRegionFilter = !selectedCountry || 
        (machine.country === selectedCountry && 
        (!selectedRegion || machine.region === selectedRegion));
      
      return passesStockFilter && passesRegionFilter;
    });
  }, [processedMachineData, showLowStockOnly, selectedCountry, selectedRegion]);

  const handleSelectCountryRegion = useCallback((country: string, region: string) => {
    setSelectedCountry(country || null);
    setSelectedRegion(region || null);
  }, []);

  return {
    showLowStockOnly,
    setShowLowStockOnly,
    selectedCountry,
    selectedRegion,
    filteredMachines,
    handleSelectCountryRegion
  };
};
