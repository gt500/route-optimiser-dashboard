
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Truck, MapPin, Clock, ArrowRight } from 'lucide-react';
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

const Dashboard = () => {
  // Sample data for charts
  const deliveryData = [
    { name: 'Mon', deliveries: 24 },
    { name: 'Tue', deliveries: 18 },
    { name: 'Wed', deliveries: 29 },
    { name: 'Thu', deliveries: 32 },
    { name: 'Fri', deliveries: 27 },
    { name: 'Sat', deliveries: 15 },
    { name: 'Sun', deliveries: 8 },
  ];

  const fuelData = [
    { name: 'Routes Optimized', value: 68 },
    { name: 'Standard Routes', value: 32 },
  ];

  const COLORS = ['#0088FE', '#D3D3D3'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5 min</div>
            <p className="text-xs text-muted-foreground">Per optimized route</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R7,820</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Deliveries</CardTitle>
              <p className="text-sm text-muted-foreground">Overview of deliveries this week</p>
            </div>
            <BarChart className="h-4 w-4 text-muted-foreground" />
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
                  <Bar dataKey="deliveries" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
            <p className="text-sm text-muted-foreground">Fuel efficiency improvements</p>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={fuelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fuelData.map((entry, index) => (
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
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">Routes optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Upcoming Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Cape Town Central Route</div>
                  <div className="text-sm text-muted-foreground">7 locations • 48 cylinders</div>
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Stellenbosch Area Route</div>
                  <div className="text-sm text-muted-foreground">5 locations • 35 cylinders</div>
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Western Cape Route</div>
                  <div className="text-sm text-muted-foreground">6 locations • 42 cylinders</div>
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full">View All</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Recent Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Cape Town Area #1</div>
                  <div className="text-sm text-muted-foreground">28 km • 1 day ago</div>
                </div>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground py-1 px-2 rounded-full">
                  R345.00
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Paarl Area Route</div>
                  <div className="text-sm text-muted-foreground">36 km • 2 days ago</div>
                </div>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground py-1 px-2 rounded-full">
                  R442.00
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Strand Area Route</div>
                  <div className="text-sm text-muted-foreground">24 km • 3 days ago</div>
                </div>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground py-1 px-2 rounded-full">
                  R345.00
                </div>
              </div>
              <Button variant="outline" className="w-full">View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
