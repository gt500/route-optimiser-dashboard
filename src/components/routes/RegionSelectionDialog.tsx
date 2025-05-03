
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';
import { toast } from 'sonner';

interface RegionSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (country: string, region: string) => void;
}

const RegionSelectionDialog: React.FC<RegionSelectionDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [countriesWithRegions, setCountriesWithRegions] = useState<{country: string, regions: string[]}[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  useEffect(() => {
    const regions = getStoredCountryRegions();
    setCountriesWithRegions(regions);
    
    // Default to South Africa if available
    const southAfrica = regions.find(r => r.country === 'South Africa');
    if (southAfrica) {
      setSelectedCountry('South Africa');
      setAvailableRegions(southAfrica.regions);
      if (southAfrica.regions.length > 0) {
        setSelectedRegion(southAfrica.regions[0]);
      }
    } else if (regions.length > 0) {
      setSelectedCountry(regions[0].country);
      setAvailableRegions(regions[0].regions);
      if (regions[0].regions.length > 0) {
        setSelectedRegion(regions[0].regions[0]);
      }
    }
  }, [open]); // Re-initialize when dialog opens

  useEffect(() => {
    if (selectedCountry) {
      const country = countriesWithRegions.find(c => c.country === selectedCountry);
      if (country) {
        setAvailableRegions(country.regions);
        if (country.regions.length > 0 && !country.regions.includes(selectedRegion)) {
          setSelectedRegion(country.regions[0]);
        } else if (country.regions.length === 0) {
          setSelectedRegion('');
        }
      }
    }
  }, [selectedCountry, countriesWithRegions]);

  const handleCountryChange = (country: string) => {
    console.log("Country changed to:", country);
    setSelectedCountry(country);
  };

  const handleRegionChange = (region: string) => {
    console.log("Region changed to:", region);
    setSelectedRegion(region);
  };

  const handleContinue = () => {
    console.log("Continue button clicked with", selectedCountry, selectedRegion);
    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }
    
    if (!selectedRegion && availableRegions.length > 0) {
      toast.error('Please select a region');
      return;
    }
    
    // Call the onComplete callback with the selected country and region
    onComplete(selectedCountry, selectedRegion);
    
    // Close the dialog
    onOpenChange(false);
    
    console.log("Dialog should be closed now");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Delivery Region</DialogTitle>
          <DialogDescription>
            Choose the country and region for your delivery route
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countriesWithRegions.map((item) => (
                  <SelectItem key={item.country} value={item.country}>
                    {item.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select
              value={selectedRegion}
              onValueChange={handleRegionChange}
              disabled={availableRegions.length === 0}
            >
              <SelectTrigger id="region">
                <SelectValue placeholder={availableRegions.length === 0 ? "No regions available" : "Select region"} />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableRegions.length === 0 && (
              <p className="text-xs text-muted-foreground">No regions available for this country</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegionSelectionDialog;
