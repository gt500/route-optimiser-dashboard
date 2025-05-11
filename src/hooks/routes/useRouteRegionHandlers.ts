
import { useCallback } from 'react';
import { RouteState } from './types';
import { toast } from 'sonner';

export const useRouteRegionHandlers = (
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>
) => {
  const setRouteRegion = useCallback((country: string, region: string) => {
    console.log("Setting route region in useRouteRegionHandlers:", country, region);
    
    if (!country || !region) {
      console.error("Invalid country or region values:", { country, region });
      toast.error("Invalid region selection");
      return;
    }
    
    // Update the route state with the new country and region
    setRoute(prev => {
      const updatedRoute = {
        ...prev,
        country,
        region
      };
      
      console.log("Updated route with region:", updatedRoute);
      
      // Show confirmation toast
      toast.success(`Selected region: ${region}, ${country}`);
      
      return updatedRoute;
    });
    
  }, [setRoute]);
  
  return { setRouteRegion };
};
