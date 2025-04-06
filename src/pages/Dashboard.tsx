
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Truck, MapPin, Clock, ArrowRight, Calendar, RefreshCw } from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useRouteData } from '@/hooks/fleet/useRouteData';

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

interface DeliveryData {
  id: string;
  route_id: string;
  location_id: string;
  sequence: number;
  cylinders: number;
  location_name?: string;
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

  const COLORS = ['#0088FE', '#8B5CF6'];

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

      // Fetch optimization stats
      const stats = await getOptimizationStats();
      setOptimizationStats(stats);
      
      setOptimizationData([
        { name: 'Routes Optimized', value: stats.optimized },
        { name: 'Standard Routes', value: stats.standard },
      ]);

      // Fetch weekly delivery data
      const weeklyData = await getWeeklyDeliveryData();
      setDeliveryData(weeklyData);

      const { data: upcomingData, error: upcomingError } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'scheduled')
        .filter('date', 'like', `${todayDateString}%`)
        .order('date', { ascending: true });
        
      if (upcomingError) {
        console.error('Error fetching upcoming deliveries:', upcomingError);
      } else if (upcomingData && upcomingData.length > 0) {
        const upcomingWithDetails = await Promise.all(upcomingData.map(async (route) => {
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
        
        setUpcomingDeliveries(upcomingWithDetails);
      } else {
        console.log('No upcoming deliveries found for today');
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
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Truck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoutes}</div>
            <p className="text-xs text-gray-400">From last week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLocations}</div>
            <p className="text-xs text-gray-400">Delivered to last week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeSaved.toFixed(1)} min</div>
            <p className="text-xs text-gray-400">Per optimized route</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{fuelSavings.toLocaleString()}</div>
            <p className="text-xs text-gray-400">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Deliveries</CardTitle>
              <p className="text-sm text-gray-400">Overview of deliveries this week</p>
            </div>
            <BarChart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={deliveryData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }} 
                  />
                  <Bar dataKey="deliveries" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
            <p className="text-sm text-gray-400">Fuel efficiency improvements</p>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={optimizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {optimizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <div className="text-2xl font-bold">
                  {optimizationStats.percentage}%
                </div>
                <p className="text-xs text-gray-400">Routes optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader>
            <CardTitle>Upcoming Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeliveries.length > 0 ? (
                upcomingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{delivery.name}</div>
                      <div className="text-sm text-gray-400">
                        {delivery.locationsCount} locations • {delivery.cylindersCount} cylinders • {new Date(delivery.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                  <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">No deliveries scheduled for today</div>
                    <div className="text-sm text-gray-400">Schedule deliveries in the Routes section</div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button variant="outline" className="w-full">View All</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
          <CardHeader>
            <CardTitle>Recent Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRoutes.length > 0 ? (
                recentRoutes.map((route) => (
                  <div key={route.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm text-gray-400">
                        {route.total_distance?.toFixed(1) || '0'} km • {new Date(route.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs font-medium bg-gray-700 text-white py-1 px-2 rounded-full">
                      R{route.estimated_cost?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                  <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">No recent routes</div>
                    <div className="text-sm text-gray-400">Complete routes to see them here</div>
                  </div>
                  <div className="text-xs font-medium bg-gray-700 text-white py-1 px-2 rounded-full">
                    R0.00
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full">View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
