
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
    if (!isLoading && routeData.length > 0) {
      processRouteData();
    } else if (!isLoading) {
      // If we're not loading but there's no data, set empty chart data
      setChartData([]);
      setLoading(false);
    }
  }, [isLoading, routeData]);
  
  const processRouteData = () => {
    setLoading(true);
    try {
      console.log('RouteEfficiencyChart - Processing route data for chart, routes length:', routeData.length);
      
      // Create a map to categorize routes based on keywords
      const routeCategories = {
        'Cape Town CBD': ['cape town', 'cbd', 'city center', 'downtown'],
        'Gas Depot - Southern Suburbs': ['southern suburbs', 'claremont', 'kenilworth', 'wynberg', 'retreat', 'tokai'],
        'Northern Distribution Line': ['northern', 'durbanville', 'bellville', 'brackenfell', 'kraaifontein'],
        'Atlantic Seaboard': ['atlantic', 'seaboard', 'sea point', 'camps bay', 'clifton', 'green point'],
        'Stellenbosch Distribution': ['stellenbosch', 'university', 'winelands'],
        'West Coast': ['west coast', 'blouberg', 'table view', 'melkbos']
      };
      
      // Categorize routes based on their name and keywords
      const categorizedRoutes: Record<string, any[]> = {};
      
      routeData.forEach(route => {
        let matched = false;
        const routeName = (route.name || '').toLowerCase();
        
        // Match route to a category
        for (const [category, keywords] of Object.entries(routeCategories)) {
          if (keywords.some(keyword => routeName.includes(keyword))) {
            if (!categorizedRoutes[category]) {
              categorizedRoutes[category] = [];
            }
            categorizedRoutes[category].push(route);
            matched = true;
            break;
          }
        }
        
        // If no category matches, assign to a default category
        if (!matched) {
          // Get the first part of the route name before any delimiters
          const defaultCategory = route.name.split(/[-–—]/)[0].trim();
          if (!categorizedRoutes[defaultCategory]) {
            categorizedRoutes[defaultCategory] = [];
          }
          categorizedRoutes[defaultCategory].push(route);
        }
      });
      
      console.log('RouteEfficiencyChart - Categorized routes:', Object.keys(categorizedRoutes));
      
      // Use the routeLegendData for chart categories
      const chartDataArray = routeLegendData.map(legend => {
        const categoryRoutes = categorizedRoutes[legend.name] || [];
        console.log(`RouteEfficiencyChart - Found ${categoryRoutes.length} routes for ${legend.name}`);
        
        if (categoryRoutes.length === 0) {
          // If no routes in this category, use some sample data
          return {
            name: legend.name,
            time: 0,
            distance: 0,
            cost: 0,
            cylinders: 0
          };
        }
        
        // Calculate averages for this route type
        const totalDistance = categoryRoutes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
        const totalDuration = categoryRoutes.reduce((sum, route) => sum + (route.total_duration || 0), 0);
        const totalCost = categoryRoutes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
        const totalCylinders = categoryRoutes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
        
        return {
          name: legend.name,
          time: Math.round(totalDuration / 60 / Math.max(1, categoryRoutes.length)), // Convert seconds to minutes
          distance: Math.round((totalDistance / Math.max(1, categoryRoutes.length)) * 10) / 10, // Average with 1 decimal
          cost: Math.round(totalCost / Math.max(1, categoryRoutes.length)),
          cylinders: Math.round(totalCylinders / Math.max(1, categoryRoutes.length))
        };
      });
      
      console.log('RouteEfficiencyChart - Generated chart data:', chartDataArray);
      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error processing route data for chart:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

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
