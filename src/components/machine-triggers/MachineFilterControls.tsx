
import React from 'react';
import { Toggle } from "@/components/ui/toggle";
import { Package } from "lucide-react";
import RegionSelector from './RegionSelector';

interface MachineFilterControlsProps {
  showLowStockOnly: boolean;
  setShowLowStockOnly: (value: boolean) => void;
  selectedCountry: string | null;
  selectedRegion: string | null;
  onSelectCountryRegion: (country: string, region: string) => void;
  countryRegions: Array<{ country: string; regions: string[] }>;
  onAddRegion: (country: string) => void;
}

const MachineFilterControls: React.FC<MachineFilterControlsProps> = ({
  showLowStockOnly,
  setShowLowStockOnly,
  selectedCountry,
  selectedRegion,
  onSelectCountryRegion,
  countryRegions,
  onAddRegion
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <RegionSelector
        selectedCountry={selectedCountry}
        selectedRegion={selectedRegion}
        onSelectCountryRegion={onSelectCountryRegion}
        countryRegions={countryRegions}
        onAddRegion={onAddRegion}
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
  );
};

export default MachineFilterControls;
