
import { useState } from 'react';

export const useRegionSelection = (
  defaultCountry: string = 'South Africa',
  defaultRegion: string = 'Western Cape'
) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegion);
  const [regionSelectionOpen, setRegionSelectionOpen] = useState(false);

  const handleRegionChange = (country: string, region: string) => {
    setSelectedCountry(country);
    setSelectedRegion(region);
    setRegionSelectionOpen(false);
  };

  const openRegionSelection = () => {
    setRegionSelectionOpen(true);
  };

  return {
    selectedCountry,
    selectedRegion,
    regionSelectionOpen,
    setRegionSelectionOpen,
    handleRegionChange,
    openRegionSelection
  };
};
