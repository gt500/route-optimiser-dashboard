
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, MapPin } from "lucide-react";
import { CountryRegion } from "./types";

interface RegionSelectorProps {
  selectedCountry: string | null;
  selectedRegion: string | null;
  onSelectCountryRegion: (country: string, region: string) => void;
  countryRegions: CountryRegion[];
  onAddRegion: (country: string) => void;
}

const RegionSelector = ({
  selectedCountry,
  selectedRegion,
  onSelectCountryRegion,
  countryRegions,
  onAddRegion
}: RegionSelectorProps) => {
  return (
    <div className="mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {selectedCountry && selectedRegion 
              ? `${selectedCountry} - ${selectedRegion}` 
              : "All Locations"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Select Location</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onSelectCountryRegion("", "")}
            className="cursor-pointer"
          >
            All Locations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {countryRegions.map((item) => (
            <DropdownMenuSub key={item.country}>
              <DropdownMenuSubTrigger className="cursor-pointer">
                {item.country}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {item.regions.map((region) => (
                  <DropdownMenuItem
                    key={region}
                    onClick={() => onSelectCountryRegion(item.country, region)}
                    className="cursor-pointer"
                  >
                    {region}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onAddRegion(item.country)}
                  className="cursor-pointer text-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Region
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RegionSelector;
