
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
      console.log("Previous route state:", prev);
      const updatedRoute = {
        ...prev,
        country,
        region
      };
      
      console.log("Updated route with region:", updatedRoute);
      
      // Store in session storage for persistence
      try {
        sessionStorage.setItem('selected_route_region', JSON.stringify({ country, region }));
      } catch (error) {
        console.error("Failed to save region to session storage:", error);
      }
      
      // Show confirmation toast
      toast.success(`Selected region: ${region}, ${country}`);
      
      return updatedRoute;
    });
    
  }, [setRoute]);
  
  // Recover region from session storage if available
  const recoverRegionSelection = useCallback(() => {
    try {
      const savedRegion = sessionStorage.getItem('selected_route_region');
      if (savedRegion) {
        const { country, region } = JSON.parse(savedRegion);
        if (country && region) {
          console.log("Recovering region selection from session storage:", country, region);
          setRouteRegion(country, region);
          return { country, region };
        }
      }
    } catch (error) {
      console.error("Failed to recover region from session storage:", error);
    }
    return null;
  }, [setRouteRegion]);
  
  return { setRouteRegion, recoverRegionSelection };
};
