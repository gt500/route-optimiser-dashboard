
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { TimePeriod } from '@/hooks/analyticsTypes';
import { COLORS } from '../data/routeLegendData';

interface OverviewChartsProps {
  monthlyDeliveries: { name: string; value: number }[];
  fuelConsumption: { name: string; value: number }[];
  routeDistribution: { name: string; value: number }[];
  timePeriod: TimePeriod;
  isLoading: boolean;
}

const OverviewCharts: React.FC<OverviewChartsProps> = ({
  monthlyDeliveries,
  fuelConsumption,
  routeDistribution,
  timePeriod,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
            <CardDescription>Number of deliveries by {timePeriod === 'year' ? 'month' : 'day'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyDeliveries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyDeliveries}
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
              {fuelConsumption.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fuelConsumption}
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
              {routeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={routeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {routeDistribution.map((entry, index) => (
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
              {monthlyDeliveries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyDeliveries}
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
    </div>
  );
};

export default OverviewCharts;
