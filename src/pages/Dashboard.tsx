import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Truck, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import StatCard from '@/components/dashboard/StatCard';
import WeeklyDeliveryChart from '@/components/dashboard/WeeklyDeliveryChart';
import OptimizationChart from '@/components/dashboard/OptimizationChart';
import UpcomingDeliveries from '@/components/dashboard/UpcomingDeliveries';
import RecentRoutes from '@/components/dashboard/RecentRoutes';

interface RouteData {
  id: string;
  name: string;
  date: string;
  total_cylinders: number;
  total_distance: number;
  total_duration: number;
  status: string;
  estimated_cost: number;
  locationsCount?: number;
  cylindersCount?: number;
}

interface OptimizationStats {
  optimized: number;
  standard: number;
  percentage: number;
}

const Dashboard = () => {
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [avgTimeSaved, setAvgTimeSaved] = useState(0);
  const [fuelSavings, setFuelSavings] = useState(0);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<RouteData[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RouteData[]>([]);
  const [optimizationData, setOptimizationData] = useState<{ name: string; value: number }[]>([]);
  const [optimizationStats, setOptimizationStats] = useState<OptimizationStats>({
    optimized: 0,
    standard: 0,
    percentage: 0
  });
  const [deliveryData, setDeliveryData] = useState([
    { name: 'Mon', deliveries: 0 },
    { name: 'Tue', deliveries: 0 },
    { name: 'Wed', deliveries: 0 },
    { name: 'Thu', deliveries: 0 },
    { name: 'Fri', deliveries: 0 },
    { name: 'Sat', deliveries: 0 },
    { name: 'Sun', deliveries: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { getOptimizationStats, getWeeklyDeliveryData } = useRouteData();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);

      const lastWeekFormatted = lastWeek.toISOString();
      const todayFormatted = today.toISOString();
      const todayDateString = today.toISOString().split('T')[0];

      const { data: recentRoutesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .gte('date', lastWeekFormatted)
        .order('date', { ascending: false });

      if (routesError) {
        console.error('Error fetching recent routes:', routesError);
        return;
      }

      if (recentRoutesData) {
        setTotalRoutes(recentRoutesData.length);

        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('location_id, route_id')
          .in('route_id', recentRoutesData.map(route => route.id));
          
        if (deliveryError) {
          console.error('Error fetching deliveries:', deliveryError);
        } else if (deliveryData) {
          const uniqueLocations = new Set(deliveryData.map(d => d.location_id));
          setTotalLocations(uniqueLocations.size);
        }
        
        const standardRouteTime = 95;
        const totalTimeSaved = recentRoutesData.reduce((total, route) => {
          const standardTime = route.total_duration * 1.25;
          return total + (standardTime - route.total_duration);
        }, 0);
        
        const avgTimePerRoute = recentRoutesData.length > 0 ? 
          totalTimeSaved / recentRoutesData.length : 0;
        
        setAvgTimeSaved(Math.round(avgTimePerRoute));
        
        const fuelCostPerLiter = 21.95;
        const totalFuelSaved = recentRoutesData.reduce((total, route) => {
          const standardFuelCost = route.estimated_cost * 1.15;
          return total + (standardFuelCost - route.estimated_cost);
        }, 0);
        
        setFuelSavings(Math.round(totalFuelSaved));
      }

      const stats = await getOptimizationStats();
      setOptimizationStats(stats);
      
      setOptimizationData([
        { name: 'Routes Optimized', value: stats.optimized },
        { name: 'Standard Routes', value: stats.standard },
      ]);

      const weeklyData = await getWeeklyDeliveryData();
      setDeliveryData(weeklyData);

      const { data: activeRoutesData, error: activeRoutesError } = await supabase
        .from('routes')
        .select('*')
        .in('status', ['scheduled', 'in_progress'])
        .order('date', { ascending: true });
        
      if (activeRoutesError) {
        console.error('Error fetching active routes:', activeRoutesError);
      } else if (activeRoutesData && activeRoutesData.length > 0) {
        const activeWithDetails = await Promise.all(activeRoutesData.map(async (route) => {
          const { data: deliveries } = await supabase
            .from('deliveries')
            .select('*, locations!inner(*)')
            .eq('route_id', route.id);
            
          return {
            ...route,
            locationsCount: deliveries?.length || 0,
            cylindersCount: route.total_cylinders
          };
        }));
        
        const formattedDeliveries = activeWithDetails.map(route => ({
          id: route.id,
          name: route.name,
          date: route.date,
          locationsCount: route.locationsCount || 0,
          cylindersCount: route.cylindersCount || route.total_cylinders,
          status: route.status
        }));
        
        setUpcomingDeliveries(formattedDeliveries);
      } else {
        console.log('No upcoming or in-progress deliveries found');
        setUpcomingDeliveries([]);
      }

      const { data: completedData, error: completedError } = await supabase
        .from('routes')
        .select('*')
        .in('status', ['completed', 'in_progress'])
        .order('date', { ascending: false })
        .limit(3);
        
      if (completedError) {
        console.error('Error fetching completed routes:', completedError);
      } else if (completedData && completedData.length > 0) {
        setRecentRoutes(completedData);
      } else {
        console.log('No recent routes found with confirmed loads');
        setRecentRoutes(recentRoutesData?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboardData} 
          disabled={isLoading}
          className="flex gap-2 items-center"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Routes" 
          value={totalRoutes} 
          subtitle="From last week" 
          icon={<Truck className="h-4 w-4 text-gray-400" />}
        />
        <StatCard 
          title="Total Locations" 
          value={totalLocations} 
          subtitle="Delivered to last week" 
          icon={<MapPin className="h-4 w-4 text-gray-400" />}
        />
        <StatCard 
          title="Avg. Time Saved" 
          value={`${avgTimeSaved.toFixed(1)} min`} 
          subtitle="Per optimized route" 
          icon={<Clock className="h-4 w-4 text-gray-400" />}
        />
        <StatCard 
          title="Fuel Savings" 
          value={`R${fuelSavings.toLocaleString()}`} 
          subtitle="This week" 
          icon={<MapPin className="h-4 w-4 text-gray-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WeeklyDeliveryChart data={deliveryData} />
        <OptimizationChart data={optimizationData} percentage={optimizationStats.percentage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpcomingDeliveries deliveries={upcomingDeliveries} />
        <RecentRoutes routes={recentRoutes} />
      </div>
    </div>
  );
};

export default Dashboard;
