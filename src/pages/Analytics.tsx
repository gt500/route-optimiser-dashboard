
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronDownIcon, 
  DownloadIcon, 
  RefreshCw,
  XIcon,
  TruckIcon,
  Fuel,
  Route,
  Package,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { format, subDays } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Define the route legend data
const routeLegendData = [
  { id: 'Route 1', name: 'Food Lovers Market - Cape Town CBD', color: '#0088FE' },
  { id: 'Route 2', name: 'Gas Depot - Southern Suburbs', color: '#00C49F' },
  { id: 'Route 3', name: 'Northern Distribution Line', color: '#FFBB28' },
  { id: 'Route 4', name: 'Atlantic Seaboard', color: '#FF8042' },
  { id: 'Route 5', name: 'Stellenbosch Distribution', color: '#8884d8' },
];

type DetailType = 'deliveries' | 'fuel' | 'route' | 'cylinders' | null;

const Analytics = () => {
  const { 
    analyticsData, 
    timePeriod, 
    setTimePeriod, 
    isLoading, 
    fetchData 
  } = useAnalyticsData();

  const routeDataHook = useRouteData();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<DetailType>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [routeLegendOpen, setRouteLegendOpen] = useState(false);

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  // Calculate percent changes (in a real app, this would compare to previous periods)
  const deliveriesChange = 12; // Placeholder
  const fuelCostChange = -4; // Placeholder
  const routeLengthChange = -8; // Placeholder
  const cylindersChange = 15; // Placeholder

  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const showCardDetail = async (type: DetailType) => {
    if (!type) return;
    
    setDetailType(type);
    setDetailLoading(true);
    setDetailOpen(true);

    // Get data for last 7 days
    const today = new Date();
    const lastWeek = subDays(today, 7);
    
    try {
      const routes = await routeDataHook.fetchRouteData();
      
      // Filter for routes in the last 7 days
      const recentRoutes = routes.filter(route => {
        const routeDate = new Date(route.date);
        return routeDate >= lastWeek && routeDate <= today;
      });

      // Sort by date, most recent first
      recentRoutes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Format for display
      const formattedData = recentRoutes.map(route => ({
        id: route.id,
        name: route.name,
        date: format(new Date(route.date), 'MMM d, yyyy'),
        rawDate: new Date(route.date),
        distance: route.total_distance || 0,
        duration: route.total_duration || 0,
        cost: route.estimated_cost || 0,
        cylinders: route.total_cylinders || 0,
        status: route.status
      }));

      setDetailData(formattedData);
      
      switch(type) {
        case 'deliveries':
          setDetailTitle('Recent Deliveries');
          break;
        case 'fuel':
          setDetailTitle('Recent Fuel Costs');
          break;
        case 'route':
          setDetailTitle('Recent Route Lengths');
          break;
        case 'cylinders':
          setDetailTitle('Recent Cylinder Deliveries');
          break;
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Delivery performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timePeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchData()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => showCardDetail('deliveries')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.deliveries.toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 mr-1">{deliveriesChange}%</span>
              <span className="text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => showCardDetail('fuel')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{analyticsData.fuelCost.toFixed(2)}</div>
            <div className="flex items-center pt-1">
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs text-red-500 mr-1">{fuelCostChange}%</span>
              <span className="text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => showCardDetail('route')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Route Length</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.routeLength.toFixed(1)} km</div>
            <div className="flex items-center pt-1">
              <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 mr-1">{routeLengthChange}%</span>
              <span className="text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
          onClick={() => showCardDetail('cylinders')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cylinders Delivered</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.cylinders.toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 mr-1">{cylindersChange}%</span>
              <span className="text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{detailTitle}</span>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)}>
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Data from the last 7 days
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : detailData.length > 0 ? (
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4">
                {detailData.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {detailType === 'deliveries' || detailType === 'route' ? (
                          <div>
                            <p className="text-sm text-muted-foreground">Distance</p>
                            <p className="text-lg font-medium">{item.distance.toFixed(1)} km</p>
                          </div>
                        ) : null}
                        
                        {detailType === 'fuel' ? (
                          <div>
                            <p className="text-sm text-muted-foreground">Fuel Cost</p>
                            <p className="text-lg font-medium">R{item.cost.toFixed(2)}</p>
                          </div>
                        ) : null}
                        
                        {detailType === 'cylinders' ? (
                          <div>
                            <p className="text-sm text-muted-foreground">Cylinders</p>
                            <p className="text-lg font-medium">{item.cylinders}</p>
                          </div>
                        ) : null}
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="text-lg font-medium capitalize">{item.status.replace('_', ' ')}</p>
                        </div>
                        
                        {/* Always show some basic info regardless of the detail type */}
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-lg font-medium">{Math.round((item.duration || 0) / 60)} min</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Cost</p>
                          <p className="text-lg font-medium">R{item.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">No data available for the last 7 days</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Route Legend Dialog */}
      <Dialog open={routeLegendOpen} onOpenChange={setRouteLegendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Route Legend</DialogTitle>
            <DialogDescription>
              Details about each route in the performance chart
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {routeLegendData.map((route) => (
              <div key={route.id} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: route.color }}
                ></div>
                <div>
                  <p className="font-medium">{route.id}</p>
                  <p className="text-sm text-muted-foreground">{route.name}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="routes">Route Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Deliveries</CardTitle>
                <CardDescription>Number of deliveries by {timePeriod === 'year' ? 'month' : 'day'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analyticsData.monthlyDeliveries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.monthlyDeliveries}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }} 
                        />
                        <Bar dataKey="value" name="Deliveries" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {isLoading ? "Loading data..." : "No delivery data available for this period"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Fuel Consumption</CardTitle>
                <CardDescription>Fuel costs by {timePeriod === 'year' ? 'month' : 'day'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analyticsData.fuelConsumption.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.fuelConsumption}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }} 
                        />
                        <Line type="monotone" dataKey="value" name="Fuel Cost (R)" stroke="#0088FE" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {isLoading ? "Loading data..." : "No fuel consumption data available for this period"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Delivery Distribution</CardTitle>
                <CardDescription>Top locations by number of cylinders delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {analyticsData.routeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.routeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.routeDistribution.map((entry, index) => (
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
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground">
                      {isLoading ? "Loading data..." : "No location distribution data available for this period"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Delivery Trends</CardTitle>
                <CardDescription>Delivery pattern over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analyticsData.monthlyDeliveries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsData.monthlyDeliveries}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }} 
                        />
                        <Area type="monotone" dataKey="value" name="Deliveries" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {isLoading ? "Loading data..." : "No trend data available for this period"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Distribution of operational costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {analyticsData.costBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.costBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.costBreakdown.map((entry, index) => (
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      {isLoading ? "Loading data..." : "No cost breakdown data available for this period"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Route Efficiency</CardTitle>
                <CardDescription>Performance metrics for routes</CardDescription>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setRouteLegendOpen(true)}
                    className="rounded-full h-8 w-8"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="left" className="w-64">
                  <p className="text-sm">
                    Click for detailed explanation of each route in the performance chart
                  </p>
                </HoverCardContent>
              </HoverCard>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {analyticsData.monthlyDeliveries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Route 1', time: 45, distance: 32, cost: 280 },
                        { name: 'Route 2', time: 38, distance: 27, cost: 230 },
                        { name: 'Route 3', time: 52, distance: 40, cost: 320 },
                        { name: 'Route 4', time: 32, distance: 22, cost: 180 },
                        { name: 'Route 5', time: 42, distance: 30, cost: 260 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                      <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="time" name="Time (min)" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="distance" name="Distance (km)" fill="#00C49F" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="cost" name="Cost (R)" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      {isLoading ? "Loading data..." : "No route efficiency data available for this period"}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Inline Route Legend */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routeLegendData.map((route) => (
                  <RouteMetricsCard
                    key={route.id}
                    title={route.id}
                    value={route.name}
                    color={`bg-gradient-to-br from-[${route.color}]/90 to-[${route.color}]`}
                    icon={<Route className="h-4 w-4" />}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
