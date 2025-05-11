
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { FleetApi } from '@/api/fleet.api';

const fleetApi = new FleetApi();

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fleetData, setFleetData] = useState<any>(null);
  const [routeOptimizationStats, setRouteOptimizationStats] = useState<any>(null);
  const [weeklyDeliveryData, setWeeklyDeliveryData] = useState<any>(null);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);
  const { toast } = useToast();
  const routeDataHook = useRouteData();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all the data we need
      const fleetData = await fleetApi.fetchFleetData();
      
      // Ensure we only count the first 2 vehicles (TRK-001 and TRK-002)
      if (fleetData && fleetData.vehicles && fleetData.vehicles.length > 2) {
        fleetData.vehicles = fleetData.vehicles.slice(0, 2);
      }
      
      // Get optimization stats and weekly delivery data
      const optimizationStats = await routeDataHook.getOptimizationStats();
      const weeklyData = await routeDataHook.getWeeklyDeliveryData();
      
      // Get recent and upcoming routes
      const routeHistory = await routeDataHook.fetchRouteHistory();
      
      // Set recent routes (last 3 completed routes)
      const recentRoutesData = routeHistory
        .filter(route => route.status === 'completed')
        .slice(0, 3);
      
      // Set the state with fetched data
      setFleetData(fleetData);
      setRouteOptimizationStats(optimizationStats);
      setWeeklyDeliveryData(weeklyData);
      setRecentRoutes(recentRoutesData);
      
      // Log the fetched data
      console.log("Fetched fleet data:", fleetData);
      console.log("Fetched route optimization stats:", optimizationStats);
      console.log("Fetched weekly delivery data:", weeklyData);
      console.log("Recent routes:", recentRoutesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    isLoading,
    fleetData,
    routeOptimizationStats,
    weeklyDeliveryData,
    recentRoutes,
    fetchDashboardData
  };
};

export default useDashboardData;
