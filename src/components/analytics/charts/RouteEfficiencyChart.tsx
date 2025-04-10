
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
import { toast } from 'sonner';

const FULL_LOAD_THRESHOLD = 20;

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
  const { fetchRouteHistory } = useRouteData();
  const [realWestCoastData, setRealWestCoastData] = useState<any | null>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  useEffect(() => {
    const fetchWestCoastData = async () => {
      try {
        console.log('Fetching completed West Coast route data...');
        setDataFetchAttempted(true);
        
        // Get completed routes from history
        const completedRoutes = await fetchRouteHistory();
        console.log('Completed routes:', completedRoutes);
        
        // Find West Coast routes among completed routes
        const westCoastRoutes = completedRoutes.filter(route => 
          route.name.toLowerCase().includes('west coast') || 
          route.route_type === 'West Coast'
        );
        
        if (westCoastRoutes && westCoastRoutes.length > 0) {
          // Sort by date to get the most recent one
          westCoastRoutes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const mostRecentRoute = westCoastRoutes[0];
          
          console.log('Found completed West Coast route data:', mostRecentRoute);
          setRealWestCoastData(mostRecentRoute);
          toast.success('Real data loaded for completed West Coast route');
        } else {
          console.log('No completed West Coast route data found in database');
          setRealWestCoastData(null);
        }
      } catch (error) {
        console.error('Error fetching West Coast route data:', error);
        setRealWestCoastData(null);
      } finally {
        updateChartData();
      }
    };
    
    const updateChartData = () => {
      const processedData = dummyChartData.map((route, index) => {
        if (route.name === 'West Coast' && realWestCoastData) {
          return {
            name: realWestCoastData.name || 'West Coast',
            routeId: 'Route 6',
            time: Math.round((realWestCoastData.total_duration || 3900) / 60),
            distance: realWestCoastData.total_distance || 22.4,
            cost: realWestCoastData.estimated_cost || 310,
            cylinders: realWestCoastData.total_cylinders || 15
          };
        }
        
        return {
          ...route,
          routeId: route.routeId || `Route ${index + 1}`
        };
      });
      
      setChartData(processedData);
      setLoading(false);
    };
    
    updateChartData();
    
    if (!dataFetchAttempted) {
      fetchWestCoastData();
    }
  }, [fetchRouteHistory, dataFetchAttempted, realWestCoastData]);

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
                      const numValue = Number(value);
                      return [`${value} (${numValue >= FULL_LOAD_THRESHOLD ? 'Full Load' : 'Partial Load'})`, 'Cylinders'];
                    }
                    return [`${value}`, name];
                  }}
                  labelFormatter={(label) => {
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
          {routeLegendData.map((route) => {
            const isWestCoast = route.name.includes('West Coast');
            const routeMetrics = isWestCoast && realWestCoastData 
              ? {
                  title: `Route 6 (Real Data)`,
                  value: realWestCoastData.name || 'West Coast',
                  subtitle: (
                    <span className="text-xs">
                      {`Distance: ${realWestCoastData.total_distance?.toFixed(1) || '0'} km • Cylinders: ${realWestCoastData.total_cylinders || '0'}`}
                    </span>
                  )
                }
              : {
                  title: route.id,
                  value: route.name,
                  subtitle: <span className="text-xs">{route.description}</span>
                };
                
            return (
              <RouteMetricsCard
                key={route.id}
                title={routeMetrics.title}
                value={routeMetrics.value}
                color={getColorClass(route.color)}
                icon={<Route className="h-4 w-4" />}
                subtitle={routeMetrics.subtitle}
                onClick={() => handleRouteCardClick(route)}
              />
            );
          })}
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
