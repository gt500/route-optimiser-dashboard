
import React, { useState, useEffect } from 'react';
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
import { Info, Route, RefreshCw } from 'lucide-react';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { routeLegendData, getColorClass } from '../data/routeLegendData';
import RouteDetailDialog from '../RouteDetailDialog';

// Define full load threshold consistently across components
const FULL_LOAD_THRESHOLD = 20;

// Dummy data for the chart
const dummyChartData = [
  { name: 'Cape Town CBD', routeId: 'Route 1', time: 45, distance: 12.5, cost: 210, cylinders: 25 },
  { name: 'Gas Depot - Southern Suburbs', routeId: 'Route 2', time: 60, distance: 18.3, cost: 280, cylinders: 32 },
  { name: 'Northern Distribution Line', routeId: 'Route 3', time: 75, distance: 24.7, cost: 350, cylinders: 18 },
  { name: 'Atlantic Seaboard', routeId: 'Route 4', time: 50, distance: 15.6, cost: 240, cylinders: 22 },
  { name: 'Stellenbosch Distribution', routeId: 'Route 5', time: 90, distance: 28.2, cost: 420, cylinders: 28 },
  { name: 'West Coast', routeId: 'Route 6', time: 65, distance: 22.4, cost: 310, cylinders: 15 },
];

interface RouteEfficiencyChartProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
  routeData: any[];
}

const RouteEfficiencyChart: React.FC<RouteEfficiencyChartProps> = ({
  isLoading,
  onRouteLegendOpen,
  routeData
}) => {
  const [routeDetailOpen, setRouteDetailOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{id: string; name: string; color: string} | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use dummy data instead of trying to process route data
    console.log('RouteEfficiencyChart - Using dummy data for chart');
    // Add routeId to the data if it doesn't exist
    const processedData = dummyChartData.map((route, index) => ({
      ...route,
      routeId: route.routeId || `Route ${index + 1}`
    }));
    setChartData(processedData);
    setLoading(false);
  }, []);

  const handleRouteCardClick = (route: {id: string; name: string; color: string}) => {
    setSelectedRoute(route);
    setRouteDetailOpen(true);
  };

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
              Click for detailed explanation of each route in the performance chart. 
              Routes with 20+ cylinders are considered full loads.
            </p>
          </HoverCardContent>
        </HoverCard>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="routeId" />
                <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }} 
                  formatter={(value, name) => {
                    if (name === 'cylinders') {
                      // Convert value to number before comparing with FULL_LOAD_THRESHOLD
                      const numValue = Number(value);
                      return [`${value} (${numValue >= FULL_LOAD_THRESHOLD ? 'Full Load' : 'Partial Load'})`, 'Cylinders'];
                    }
                    return [`${value}`, name];
                  }}
                  labelFormatter={(label) => {
                    // Find the full name for the route ID
                    const routeItem = chartData.find(item => item.routeId === label);
                    return routeItem ? `${label}: ${routeItem.name}` : label;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="time" name="Time (min)" fill="#0088FE" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="distance" name="Distance (km)" fill="#00C49F" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="cost" name="Cost (R)" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="cylinders" name="Cylinders" fill="#FF8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">No route data available</p>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routeLegendData.map((route) => (
            <RouteMetricsCard
              key={route.id}
              title={route.id}
              value={route.name}
              color={getColorClass(route.color)}
              icon={<Route className="h-4 w-4" />}
              subtitle={<span className="text-xs">{route.description}</span>}
              onClick={() => handleRouteCardClick(route)}
            />
          ))}
        </div>
      </CardContent>

      {selectedRoute && (
        <RouteDetailDialog
          open={routeDetailOpen}
          onOpenChange={setRouteDetailOpen}
          routeId={selectedRoute.id}
          routeName={selectedRoute.name}
          routeColor={getColorClass(selectedRoute.color)}
        />
      )}
    </Card>
  );
};

export default RouteEfficiencyChart;
