
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStoredCountryRegions } from '@/components/machine-triggers/utils/regionStorage';
import { MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RegionSelectionAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (country: string, region: string) => void;
}

const RegionSelectionAlertDialog: React.FC<RegionSelectionAlertDialogProps> = ({
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
      console.log('Redirecting back to routes page from alert dialog');
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

  // Handle dialog complete
  const handleComplete = () => {
    if (selectedCountry && selectedRegion) {
      console.log("AlertDialog completing with region:", selectedCountry, selectedRegion);
      onComplete(selectedCountry, selectedRegion);
      
      // Ensure we stay on routes page
      if (!location.pathname.includes('/routes')) {
        navigate('/routes', { replace: true });
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Select Route Region
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose a country and region for your route planning
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="alert-country" className="text-sm font-medium">
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger id="alert-country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                {countryRegions.map((cr) => (
                  <SelectItem key={cr.country} value={cr.country}>
                    {cr.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="alert-region" className="text-sm font-medium">
              Region
            </label>
            <Select
              value={selectedRegion}
              onValueChange={setSelectedRegion}
              disabled={availableRegions.length === 0}
            >
              <SelectTrigger id="alert-region" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                {availableRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleComplete}
            disabled={!selectedCountry || !selectedRegion}
          >
            Confirm Selection
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RegionSelectionAlertDialog;
