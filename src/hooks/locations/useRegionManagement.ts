
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegionData {
  region: string;
  country: string;
}

export const useRegionManagement = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('region, country')
        .not('region', 'is', null)
        .not('country', 'is', null);
      
      if (error) throw error;
      
      // Filter out duplicates and nulls
      const uniqueRegions = data
        .filter(item => item.region && item.country)
        .filter((item, index, self) => 
          index === self.findIndex(t => 
            t.region === item.region && t.country === item.country
          )
        )
        .sort((a, b) => a.country.localeCompare(b.country) || a.region.localeCompare(b.region));
      
      setRegions(uniqueRegions as RegionData[]);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load regions');
    } finally {
      setIsLoading(false);
    }
  };

  const selectRegion = (region: string, country: string) => {
    setSelectedRegion(region);
    setSelectedCountry(country);
  };

  const clearSelectedRegion = () => {
    setSelectedRegion(null);
    setSelectedCountry(null);
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return {
    regions,
    isLoading,
    selectedRegion,
    selectedCountry,
    selectRegion,
    clearSelectedRegion,
    fetchRegions
  };
};
