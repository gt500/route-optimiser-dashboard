
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { RouteData } from './types/routeTypes';
import { mockRoutes } from './routes/mockRouteData';
import { 
  fetchRoutes as fetchRoutesQuery,
  fetchActiveRoutes as fetchActiveRoutesQuery,
  fetchRouteHistory as fetchRouteHistoryQuery,
  fetchRouteDataByName as fetchRouteDataByNameQuery,
  getWeeklyDeliveryData as getWeeklyDeliveryDataQuery,
  getOptimizationStats as getOptimizationStatsQuery
} from './routes/routeQueries';
import { 
  startRoute as startRouteAction,
  completeRoute as completeRouteAction
} from './routes/routeUpdates';

export { RouteData } from './types/routeTypes';

export const useRouteData = () => {
  const [routes, setRoutes] = useState<RouteData[]>(mockRoutes);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});

  const fetchRoutes = useCallback(async () => {
    return await fetchRoutesQuery();
  }, []);
  
  const fetchRouteData = useCallback(async () => {
    return await fetchRoutesQuery();
  }, []);
  
  const fetchActiveRoutes = useCallback(async () => {
    return await fetchActiveRoutesQuery();
  }, []);
  
  const fetchRouteHistory = useCallback(async () => {
    return await fetchRouteHistoryQuery();
  }, []);
  
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    return await fetchRouteDataByNameQuery(routeName);
  }, []);
  
  const getWeeklyDeliveryData = useCallback(async () => {
    return await getWeeklyDeliveryDataQuery();
  }, []);
  
  const getOptimizationStats = useCallback(async () => {
    return await getOptimizationStatsQuery(routes);
  }, [routes.length]);

  const startRoute = useCallback(async (routeId: string) => {
    return await startRouteAction(routeId, routes, setRoutes, setProcessingRoutes);
  }, [routes]);

  const completeRoute = useCallback(async (routeId: string) => {
    return await completeRouteAction(routeId, routes, setRoutes, setProcessingRoutes);
  }, [routes]);

  return {
    routes,
    processingRoutes,
    fetchRoutes,
    startRoute,
    completeRoute,
    fetchRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    fetchRouteDataByName,
    getWeeklyDeliveryData,
    getOptimizationStats
  };
};
