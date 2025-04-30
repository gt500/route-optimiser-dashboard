
import { LocationType } from '@/components/locations/LocationEditDialog';
import { useRouteManagement as useRouteManagementCore } from './routes/useRouteManagement';

export { 
  routeOptimizationDefaultParams, 
  defaultVehicleConfig, 
  MAX_CYLINDERS, 
  CYLINDER_WEIGHT_KG 
} from './routes/types';

export type { VehicleConfigProps } from './routes/types';

/**
 * Wrapper hook that re-exports the core route management functionality
 * This maintains backward compatibility with any components using the hook from this path
 */
export const useRouteManagement = (initialLocations: LocationType[] = []) => {
  return useRouteManagementCore(initialLocations);
};

export default useRouteManagement;
