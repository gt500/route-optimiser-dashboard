
import { useState, useEffect, useCallback } from 'react';
import { CountryRegion } from '../types';
import { getStoredCountryRegions, saveCountryRegions } from '../utils/regionStorage';
import { useToast } from "@/hooks/use-toast";

export const useRegionManagement = () => {
  const [countryRegions, setCountryRegions] = useState<CountryRegion[]>(getStoredCountryRegions());
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [selectedCountryForRegion, setSelectedCountryForRegion] = useState("");
  const { toast } = useToast();

  // Save country regions to localStorage whenever they change
  useEffect(() => {
    saveCountryRegions(countryRegions);
  }, [countryRegions]);

  const handleAddRegionClick = useCallback((country: string) => {
    setSelectedCountryForRegion(country);
    setIsAddRegionOpen(true);
  }, []);

  const handleAddRegion = useCallback((country: string, newRegion: string) => {
    // Validate inputs before proceeding
    if (!country || !newRegion) {
      toast({
        title: "Error",
        description: "Country and region must be provided",
        variant: "destructive",
      });
      return;
    }

    // Make a copy of the current regions to avoid direct state mutation
    const updatedRegions = [...countryRegions];
    
    // Find country index
    const countryIndex = updatedRegions.findIndex(item => item.country === country);
    
    // If country doesn't exist
    if (countryIndex === -1) {
      toast({
        title: "Error",
        description: `Country "${country}" not found`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if region already exists
    const countryItem = updatedRegions[countryIndex];
    if (countryItem.regions.includes(newRegion)) {
      toast({
        title: "Duplicate Region",
        description: `Region "${newRegion}" already exists in ${country}`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the new region - Create a new array to ensure proper state update
    updatedRegions[countryIndex] = { 
      ...countryItem, 
      regions: [...countryItem.regions, newRegion]
    };
    
    // Update state with the new regions
    setCountryRegions(updatedRegions);
    
    console.log(`Added region "${newRegion}" to ${country}:`, updatedRegions);
  }, [countryRegions, toast]);

  const handleCloseRegionDialog = useCallback(() => {
    setIsAddRegionOpen(false);
  }, []);

  return {
    countryRegions,
    isAddRegionOpen,
    selectedCountryForRegion,
    handleAddRegionClick,
    handleAddRegion,
    handleCloseRegionDialog
  };
};
