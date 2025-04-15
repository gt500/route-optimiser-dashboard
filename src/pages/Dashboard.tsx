
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { FleetApi } from '@/api/fleet.api';
import RecentRoutes from '@/components/dashboard/RecentRoutes';
import UpcomingDeliveries from '@/components/dashboard/UpcomingDeliveries';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const fleetApi = new FleetApi();

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fleetData, setFleetData] = useState<any>(null);
  const [routeOptimizationStats, setRouteOptimizationStats] = useState<any>(null);
  const [weeklyDeliveryData, setWeeklyDeliveryData] = useState<any>(null);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);
  const { toast } = useToast();
  const routeDataHook = useRouteData();

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Weekly Delivery Overview'
      }
    }
  };

  // Chart data
  const data = {
    labels: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.name) : [],
    datasets: [
      {
        label: 'Completed Deliveries',
        data: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.completed) : [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      },
      {
        label: 'Scheduled Deliveries',
        data: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.scheduled) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

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
      const activeRoutes = await routeDataHook.fetchActiveRoutes();
      
      // Set recent routes (last 3 completed routes)
      const recentRoutesData = routeHistory
        .filter(route => route.status === 'completed')
        .slice(0, 3);
      
      // Set upcoming deliveries (next 3 scheduled routes)
      const upcomingDeliveriesData = activeRoutes
        .filter(route => route.status === 'scheduled' || route.status === 'in_progress')
        .slice(0, 3);
      
      // Set the state with fetched data
      setFleetData(fleetData);
      setRouteOptimizationStats(optimizationStats);
      setWeeklyDeliveryData(weeklyData);
      setRecentRoutes(recentRoutesData);
      setUpcomingDeliveries(upcomingDeliveriesData);
      
      // Log the fetched data
      console.log("Fetched fleet data:", fleetData);
      console.log("Fetched route optimization stats:", optimizationStats);
      console.log("Fetched weekly delivery data:", weeklyData);
      console.log("Recent routes:", recentRoutesData);
      console.log("Upcoming deliveries:", upcomingDeliveriesData);
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

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard" 
        text="Overview of your fleet operations."
        logo="/lovable-uploads/0b09ba82-e3f0-4fa1-ab8d-87f06fd9f31b.png"
      />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Vehicles</CardTitle>
            <CardDescription>Number of vehicles in your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {fleetData?.vehicles?.length || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Maintenance Tasks</CardTitle>
            <CardDescription>Scheduled maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {fleetData?.maintenanceItems?.length || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Routes Optimized</CardTitle>
            <CardDescription>Number of routes optimized</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {routeOptimizationStats?.routesOptimized || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fuel Saved</CardTitle>
            <CardDescription>Estimated fuel saved</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {routeOptimizationStats?.fuelSaved || 0} L
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Delivery Overview</CardTitle>
                <CardDescription>A summary of deliveries completed and scheduled each day.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-24">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Bar options={options} data={data} height={300} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <RecentRoutes routes={recentRoutes} />
          <UpcomingDeliveries deliveries={upcomingDeliveries} />
        </div>
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
