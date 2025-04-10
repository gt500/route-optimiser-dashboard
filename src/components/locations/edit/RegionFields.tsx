
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Globe } from 'lucide-react';
import { LocationType } from '@/types/location';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';

interface RegionFieldsProps {
  formData: LocationType;
  handleCountryChange: (value: string) => void;
  handleRegionChange: (value: string) => void;
  openAddRegionDialog: () => void;
}

const RegionFields = ({ 
  formData, 
  handleCountryChange, 
  handleRegionChange,
  openAddRegionDialog
}: RegionFieldsProps) => {
  const countryRegions = getStoredCountryRegions();
  const selectedCountry = formData.country || '';
  const regions = countryRegions.find(cr => cr.country === selectedCountry)?.regions || [];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Select
          value={selectedCountry}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger id="country" className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countryRegions.map((item) => (
              <SelectItem key={item.country} value={item.country}>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {item.country}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="region">Region</Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={openAddRegionDialog}
            disabled={!selectedCountry}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Region
          </Button>
        </div>
        <Select
          value={formData.region || ''}
          onValueChange={handleRegionChange}
          disabled={!selectedCountry || regions.length === 0}
        >
          <SelectTrigger id="region" className="w-full">
            <SelectValue placeholder={!selectedCountry ? "Select country first" : "Select region"} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RegionFields;
