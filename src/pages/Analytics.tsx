
import React from 'react';
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
import { ArrowUp, ArrowDown, ChevronDownIcon, DownloadIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData, TimePeriod } from '@/hooks/useAnalyticsData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const { 
    analyticsData, 
    timePeriod, 
    setTimePeriod, 
    isLoading, 
    fetchData 
  } = useAnalyticsData();

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  // Calculate percent changes (in a real app, this would compare to previous periods)
  const deliveriesChange = 12; // Placeholder
  const fuelCostChange = -4; // Placeholder
  const routeLengthChange = -8; // Placeholder
  const cylindersChange = 15; // Placeholder

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
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
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
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
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
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Route Length</CardTitle>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
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
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cylinders Delivered</CardTitle>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
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
            <CardHeader>
              <CardTitle>Route Efficiency</CardTitle>
              <CardDescription>Performance metrics for routes</CardDescription>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
