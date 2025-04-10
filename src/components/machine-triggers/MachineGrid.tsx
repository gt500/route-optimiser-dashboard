
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import MachineCard from './MachineCard';
import { MachineData, CountryRegion } from './types';
import { Toggle } from "@/components/ui/toggle";
import RegionSelector from './RegionSelector';
import AddRegionDialog from './AddRegionDialog';
import { useToast } from "@/hooks/use-toast";

interface MachineGridProps {
  machineData: MachineData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  acknowledgedAlerts: Record<string, { time: string, user: string }>;
}

// Define initial country-region structure
const initialCountryRegions: CountryRegion[] = [
  {
    country: "South Africa",
    regions: ["Western Cape", "Gauteng", "Eastern Cape", "KZN"]
  },
  {
    country: "USA",
    regions: ["Florida", "Oklahoma", "Texas", "Georgia"]
  }
];

const MachineGrid = ({ 
  machineData, 
  isLoading, 
  error, 
  acknowledgedAlerts 
}: MachineGridProps) => {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [countryRegions, setCountryRegions] = useState<CountryRegion[]>(initialCountryRegions);
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [selectedCountryForRegion, setSelectedCountryForRegion] = useState("");
  const { toast } = useToast();
  
  // Set all current machines to Western Cape region if no region specified
  const processedMachineData = useMemo(() => {
    if (!machineData) return [];
    
    return machineData.map(machine => ({
      ...machine,
      country: machine.country || "South Africa",
      region: machine.region || "Western Cape"
    }));
  }, [machineData]);
  
  // Filter machines by low stock and selected region
  const filteredMachines = useMemo(() => {
    if (!processedMachineData) return [];
    
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

  const handleSelectCountryRegion = (country: string, region: string) => {
    setSelectedCountry(country || null);
    setSelectedRegion(region || null);
  };

  const handleAddRegionClick = (country: string) => {
    setSelectedCountryForRegion(country);
    setIsAddRegionOpen(true);
  };

  const handleAddRegion = (country: string, newRegion: string) => {
    // Validate inputs before proceeding
    if (!country || !newRegion) {
      toast({
        title: "Error",
        description: "Country and region must be provided",
        variant: "destructive",
      });
      return;
    }

    setCountryRegions(prevRegions => {
      // Find country index
      const countryIndex = prevRegions.findIndex(item => item.country === country);
      
      // If country doesn't exist
      if (countryIndex === -1) {
        toast({
          title: "Error",
          description: `Country "${country}" not found`,
          variant: "destructive",
        });
        return prevRegions;
      }
      
      // Check if region already exists
      const countryItem = prevRegions[countryIndex];
      if (countryItem.regions.includes(newRegion)) {
        toast({
          title: "Duplicate Region",
          description: `Region "${newRegion}" already exists in ${country}`,
          variant: "destructive",
        });
        return prevRegions;
      }
      
      // Add the new region - Create a new array to ensure proper state update
      const updatedRegions = [...prevRegions];
      updatedRegions[countryIndex] = { 
        ...countryItem, 
        regions: [...countryItem.regions, newRegion]
      };
      
      toast({
        title: "Region Added",
        description: `Added "${newRegion}" to ${country}`,
      });
      
      // Close dialog after successful addition
      setTimeout(() => {
        setIsAddRegionOpen(false);
      }, 0);
      
      return updatedRegions;
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted rounded-t-lg"></CardHeader>
            <CardContent className="h-20 bg-muted/50 rounded-b-lg"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p>Failed to load machine data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <RegionSelector
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
          onSelectCountryRegion={handleSelectCountryRegion}
          countryRegions={countryRegions}
          onAddRegion={handleAddRegionClick}
        />
        
        <Toggle
          variant="outline"
          pressed={showLowStockOnly}
          onPressedChange={setShowLowStockOnly}
          className="flex items-center gap-2 h-10"
          aria-label="Show only machines with low stock"
        >
          <Package className="h-4 w-4" />
          <span>Low Stock Only</span>
        </Toggle>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.length > 0 ? (
          filteredMachines.map((machine, idx) => (
            <MachineCard 
              key={idx} 
              machine={machine} 
              acknowledgedAlerts={acknowledgedAlerts} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No machines match the current filter</p>
          </div>
        )}
      </div>
      
      <AddRegionDialog
        open={isAddRegionOpen}
        country={selectedCountryForRegion}
        onClose={() => setIsAddRegionOpen(false)}
        onAddRegion={handleAddRegion}
      />
    </div>
  );
};

export default MachineGrid;
