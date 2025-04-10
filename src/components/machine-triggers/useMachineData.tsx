
import { useQuery } from "@tanstack/react-query";
import { MachineData } from "./types";

const fetchMachineData = async (): Promise<MachineData[]> => {
  try {
    const response = await fetch('https://g2g-dashboard.aimrxd.com/version-test/api/1.1/obj/SITE_DATA');
    
    if (!response.ok) {
      throw new Error('Failed to fetch machine data');
    }
    
    const data = await response.json();
    return data.response.results
      .filter((item: any) => !item.SITE_NAME.includes('Food Emporium')) // Enhanced filtering to exclude any Food Emporium
      .map((item: any) => {
        // Process region and country information
        const country = item.COUNTRY || 'South Africa';
        let region = item.REGION;
        
        // Set default region based on country if not provided
        if (!region) {
          if (country === 'South Africa') {
            region = 'Western Cape';
          } else if (country === 'USA') {
            region = 'Florida';
          } else {
            // Default for any other country
            region = 'Default Region';
          }
        }
        
        return {
          site_name: item.SITE_NAME || 'Unknown Site',
          machine_name: item.M_CODE || 'Unknown Machine',
          terminal_id: item.TERMINAL_ID || item.M_CODE || item.SITE_NAME || 'Unknown Terminal',
          merchant_id: item.MERCHANT_ID || 'Unknown Merchant',
          cylinder_stock: parseInt(item.EMPTY_CYLINDERS || '0', 10),
          last_update: item.Modified_Date || new Date().toISOString(),
          country: country,
          region: region,
        };
      });
  } catch (error) {
    console.error('Error fetching machine data:', error);
    throw error;
  }
};

export const useMachineData = () => {
  return useQuery({
    queryKey: ['machineData'],
    queryFn: fetchMachineData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3, // Retry failed requests 3 times
  });
};
