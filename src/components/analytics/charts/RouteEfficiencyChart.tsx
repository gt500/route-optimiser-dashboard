
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
import { useRouteData } from '@/hooks/fleet/useRouteData';

// Define full load threshold consistently across components
const FULL_LOAD_THRESHOLD = 20;

interface RouteEfficiencyChartProps {
  isLoading: boolean;
  onRouteLegendOpen: () => void;
}

const RouteEfficiencyChart: React.FC<RouteEfficiencyChartProps> = ({
  isLoading,
  onRouteLegendOpen
}) => {
  const [routeDetailOpen, setRouteDetailOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{id: string; name: string; color: string} | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { fetchRouteData } = useRouteData();

  useEffect(() => {
    // Only load data if it hasn't been loaded yet or if isLoading prop changes from true to false
    if (!dataLoaded || isLoading) {
      const loadRouteData = async () => {
        setLoading(true);
        try {
          console.log('RouteEfficiencyChart - Starting to fetch route data');
          // Fetch actual route data from database
          const routesData = await fetchRouteData();
          
          console.log('RouteEfficiencyChart - Fetched routes data:', routesData.length, 'routes');
          
          if (!routesData.length) {
            console.log('No routes data available');
            setChartData([]);
            setLoading(false);
            setDataLoaded(true);
            return;
          }

          // Map the raw data to the format needed for the chart
          // Focus on the route names mentioned in routeLegendData
          const routeNames = routeLegendData.map(route => route.name);
          
          // Filter and summarize route data by route name
          const routeSummaries = routeNames.map(routeName => {
            // Find all routes that match this name
            const matchingRoutes = routesData.filter(route => 
              route.name && route.name.toLowerCase().includes(routeName.toLowerCase())
            );
            
            console.log(`RouteEfficiencyChart - Found ${matchingRoutes.length} routes matching "${routeName}"`);
            
            if (matchingRoutes.length === 0) {
              // Return empty data for routes with no data
              return {
                name: routeName,
                time: 0,
                distance: 0,
                cost: 0,
                cylinders: 0
              };
            }
            
            // Calculate averages for this route type
            const totalDistance = matchingRoutes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
            const totalDuration = matchingRoutes.reduce((sum, route) => sum + (route.total_duration || 0), 0);
            const totalCost = matchingRoutes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
            const totalCylinders = matchingRoutes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
            
            return {
              name: routeName,
              time: Math.round(totalDuration / 60 / matchingRoutes.length), // Convert seconds to minutes and average
              distance: Math.round(totalDistance / matchingRoutes.length * 10) / 10, // Average with 1 decimal precision
              cost: Math.round(totalCost / matchingRoutes.length),
              cylinders: Math.round(totalCylinders / matchingRoutes.length)
            };
          });
          
          console.log('RouteEfficiencyChart - Generated route summaries:', routeSummaries);
          setChartData(routeSummaries);
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading route data for chart:', error);
          setChartData([]);
        } finally {
          setLoading(false);
        }
      };

      loadRouteData();
    }
  }, [fetchRouteData, isLoading, dataLoaded]);

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
                  formatter={(value, name) => {
                    if (name === 'cylinders') {
                      // Convert value to number before comparing with FULL_LOAD_THRESHOLD
                      const numValue = Number(value);
                      return [`${value} (${numValue >= FULL_LOAD_THRESHOLD ? 'Full Load' : 'Partial Load'})`, 'Cylinders'];
                    }
                    return [`${value}`, name];
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
