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
import { Info, Route, RefreshCw, Download, Printer } from 'lucide-react';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { routeLegendData, getColorClass } from '../data/routeLegendData';
import RouteDetailDialog from '../RouteDetailDialog';
import RouteAnalysisDialog from '../RouteAnalysisDialog';
import { useRouteData, RouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';
import { FULL_LOAD_PER_SITE } from '@/hooks/delivery/types';
import { exportToPDF, printData, emailData } from '@/utils/exportUtils';
import { format } from 'date-fns';

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
  const [routeAnalysisOpen, setRouteAnalysisOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{id: string; name: string; color: string} | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchRouteHistory, fetchRouteData } = useRouteData();
  const [routesData, setRoutesData] = useState<Record<string, any>>({});
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  useEffect(() => {
    const fetchAllRoutesData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data for all routes...');
        setDataFetchAttempted(true);
        
        const { fetchRouteHistory, fetchRouteData } = useRouteData();
        
        // First, get all completed routes
        const completedRoutes = await fetchRouteHistory();
        console.log('Completed routes:', completedRoutes);
        
        // Get the latest route data
        const allRoutes = await fetchRouteData();
        console.log('All routes:', allRoutes);
        
        // Create a collection of routes by type/name
        const routesByType: Record<string, any[]> = {};
        
        [...completedRoutes, ...allRoutes].forEach(route => {
          // Use the route name as the type if route_type doesn't exist
          const routeType = route.name.toLowerCase();
          
          // Find the best match in routeLegendData
          const matchedLegend = routeLegendData.find(legend => 
            routeType.includes(legend.name.toLowerCase())
          );
          
          const typeKey = matchedLegend ? matchedLegend.name : 'Unknown';
          
          if (!routesByType[typeKey]) {
            routesByType[typeKey] = [];
          }
          routesByType[typeKey].push(route);
        });
        
        const processedRouteData: Record<string, any> = {};
        
        // Process routes data for each route type
        for (const [routeType, routes] of Object.entries(routesByType)) {
          if (routes.length > 0) {
            // Sort by date, newest first
            routes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Get the most recent route
            const recentRoute = routes[0];
            
            processedRouteData[routeType] = {
              name: recentRoute.name || routeType,
              time: Math.round((recentRoute.total_duration || 3600) / 60), // Convert seconds to minutes
              distance: recentRoute.total_distance || 0,
              cost: recentRoute.estimated_cost || 0,
              cylinders: recentRoute.total_cylinders || 0,
              routeId: `Route ${Object.keys(processedRouteData).length + 1}`
            };
          }
        }
        
        // Make sure we have data for all route legends
        routeLegendData.forEach((route, index) => {
          const routeType = route.name;
          if (!processedRouteData[routeType]) {
            // If we don't have real data for this route, use the dummy data
            const dummyRoute = routeData[index] || {
              name: routeType,
              time: 60, 
              distance: 20,
              cost: 300,
              cylinders: 25,
              routeId: `Route ${index + 1}`
            };
            
            processedRouteData[routeType] = dummyRoute;
          }
        });
        
        setRoutesData(processedRouteData);
        
        // Convert to array format for the chart
        const chartDataArray = Object.values(processedRouteData);
        setChartData(chartDataArray);
        
        toast.success('Route efficiency data loaded');
      } catch (error) {
        console.error('Error fetching route data:', error);
        // Fall back to dummy data if there's an error
        setChartData(routeData);
      } finally {
        setLoading(false);
      }
    };
    
    if (!dataFetchAttempted) {
      fetchAllRoutesData();
    } else if (routeData.length > 0 && chartData.length === 0) {
      // Fall back to dummy data if we've attempted to fetch but have no data
      setChartData(routeData);
      setLoading(false);
    }
  }, [fetchRouteHistory, fetchRouteData, dataFetchAttempted, routeData]);

  const handleRouteCardClick = (route: {id: string; name: string; color: string}) => {
    setSelectedRoute(route);
    setRouteAnalysisOpen(true);
  };

  const handleViewDetails = (route: {id: string; name: string; color: string}) => {
    setSelectedRoute(route);
    setRouteDetailOpen(true);
  };
  
  const handlePrintChart = () => {
    try {
      const formattedDate = format(new Date(), 'yyyy-MM-dd');
      
      // Convert chart data to a format suitable for printing
      const printableData = chartData.map(item => ({
        siteName: item.name,
        cylinders: item.cylinders || 0,
        kms: item.distance || 0,
        fuelCost: item.cost || 0
      }));
      
      printData(printableData, 'Route Efficiency Comparison', new Date());
      toast.success('Print view opened in new window');
    } catch (error) {
      toast.error('Failed to generate print view');
      console.error(error);
    }
  };
  
  const handleExportPDF = () => {
    try {
      const formattedDate = format(new Date(), 'yyyy-MM-dd');
      
      // Convert chart data to a format suitable for PDF export
      const exportableData = chartData.map(item => ({
        siteName: item.name,
        cylinders: item.cylinders || 0,
        kms: item.distance || 0,
        fuelCost: item.cost || 0
      }));
      
      exportToPDF(
        exportableData,
        `route-efficiency-${formattedDate}`,
        'Route Efficiency Comparison',
        new Date()
      );
      
      toast.success('PDF download started');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Route Efficiency</CardTitle>
          <CardDescription>Performance metrics for routes</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintChart}
            className="h-8"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
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
                Routes with {FULL_LOAD_PER_SITE}+ cylinders per site are considered full loads.
                AI analysis is now available by clicking on route cards.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
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
                      return [`${value} (${numValue >= FULL_LOAD_PER_SITE ? 'Full Load' : 'Partial Load'})`, 'Cylinders'];
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
            const routeTypeData = routesData[route.name];
            const isRealData = !!routeTypeData;
            
            const routeMetrics = isRealData 
              ? {
                  title: routeTypeData.routeId || route.id,
                  value: routeTypeData.name || route.name,
                  subtitle: (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">
                        {`Distance: ${routeTypeData.distance?.toFixed(1) || '0'} km • Cylinders: ${routeTypeData.cylinders || '0'}`}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(route);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteCardClick(route);
                          }}
                        >
                          AI Analysis
                        </Button>
                      </div>
                    </div>
                  )
                }
              : {
                  title: route.id,
                  value: route.name,
                  subtitle: (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">{route.description}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(route);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteCardClick(route);
                          }}
                        >
                          AI Analysis
                        </Button>
                      </div>
                    </div>
                  )
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
        <>
          <RouteDetailDialog
            open={routeDetailOpen}
            onOpenChange={setRouteDetailOpen}
            routeId={selectedRoute.id}
            routeName={selectedRoute.name}
            routeColor={getColorClass(selectedRoute.color)}
          />
          <RouteAnalysisDialog
            open={routeAnalysisOpen}
            onOpenChange={setRouteAnalysisOpen}
            routeId={selectedRoute.id}
            routeName={selectedRoute.name}
            routeColor={getColorClass(selectedRoute.color)}
          />
        </>
      )}
    </Card>
  );
};

export default RouteEfficiencyChart;
