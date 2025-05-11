
import { useCallback } from 'react';
import { RouteState } from './types';

export const useRouteRegionHandlers = (
  setRoute: React.Dispatch<React.SetStateAction<RouteState>>
) => {
  const setRouteRegion = useCallback((country: string, region: string) => {
    setRoute(prev => ({
      ...prev,
      country,
      region
    }));
  }, [setRoute]);
  
  return { setRouteRegion };
};
