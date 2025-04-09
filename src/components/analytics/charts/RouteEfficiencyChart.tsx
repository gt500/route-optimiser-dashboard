
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Info, Route } from 'lucide-react';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { routeLegendData, getColorClass } from '../data/routeLegendData';

interface RouteEfficiencyChartProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RouteEfficiencyChart: React.FC<RouteEfficiencyChartProps> = ({
  isLoading,
  onRouteLegendOpen
}) => {
  return (
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
              onClick={onRouteLegendOpen}
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
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routeLegendData.map((route) => (
            <RouteMetricsCard
              key={route.id}
              title={route.id}
              value={route.name}
              color={getColorClass(route.color)}
              icon={<Route className="h-4 w-4" />}
              subtitle={<span className="text-xs">Reference color legend</span>}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteEfficiencyChart;
