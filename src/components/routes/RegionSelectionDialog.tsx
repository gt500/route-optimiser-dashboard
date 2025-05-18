
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';
import { MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();
  const countryRegions = getStoredCountryRegions();
  
  const [selectedCountry, setSelectedCountry] = useState<string>(
    countryRegions.length > 0 ? countryRegions[0].country : ''
  );
  
  const [selectedRegion, setSelectedRegion] = useState<string>(
    countryRegions.length > 0 && countryRegions[0].regions.length > 0
      ? countryRegions[0].regions[0]
      : ''
  );

  // Ensure we stay on the routes page
  useEffect(() => {
    if (open && !location.pathname.includes('/routes')) {
      console.log('Redirecting back to routes page from dialog');
      navigate('/routes', { replace: true });
    }
  }, [open, location.pathname, navigate]);

  // Get regions for the selected country
  const availableRegions = selectedCountry
    ? countryRegions.find(cr => cr.country === selectedCountry)?.regions || []
    : [];

  // Handle country change
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    const regions = countryRegions.find(cr => cr.country === value)?.regions || [];
    setSelectedRegion(regions.length > 0 ? regions[0] : '');
  };

  // Handle dialog close
  const handleComplete = (e: React.MouseEvent) => {
    // Prevent default to avoid any unwanted navigation
    e.preventDefault();
    
    if (selectedCountry && selectedRegion) {
      console.log("Completing region selection with:", selectedCountry, selectedRegion);
      
      // Set a flag to prevent redirection to dashboard
      sessionStorage.setItem('from_region_selection', 'true');
      sessionStorage.setItem('attempting_routes', 'true');
      
      onComplete(selectedCountry, selectedRegion);
      
      // Ensure we're staying on the routes page with the create tab active
      if (!location.pathname.includes('/routes')) {
        navigate('/routes', { replace: true });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Select Route Region
          </DialogTitle>
          <DialogDescription>
            Choose a country and region for your route planning
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countryRegions.map((cr) => (
                  <SelectItem key={cr.country} value={cr.country}>
                    {cr.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="region" className="text-sm font-medium">
              Region
            </label>
            <Select
              value={selectedRegion}
              onValueChange={setSelectedRegion}
              disabled={availableRegions.length === 0}
            >
              <SelectTrigger id="region" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="default"
            onClick={handleComplete}
            disabled={!selectedCountry || !selectedRegion}
          >
            Confirm Selection
          </Button>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegionSelectionDialog;
