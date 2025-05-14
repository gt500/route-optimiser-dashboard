
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info, RefreshCw, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { FULL_LOAD_PER_SITE } from '@/hooks/delivery/types';
import { exportToPDF, printData } from '@/utils/exportUtils';
import { RouteChart } from './RouteChart';
import { RouteCardGrid } from './RouteCardGrid';
import RouteDetailDialog from '@/components/analytics/RouteDetailDialog';
import RouteAnalysisDialog from '@/components/analytics/route-analysis/RouteAnalysisDialog';

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
  const routeDataHook = useRouteData();
  const [routesData, setRoutesData] = useState<Record<string, any>>({});
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  useEffect(() => {
    const fetchAllRoutesData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data for all routes...');
        setDataFetchAttempted(true);
        
        // Get all completed routes
        const completedRoutes = await routeDataHook.fetchRouteHistory();
        console.log('Completed routes:', completedRoutes);
        
        // Get the latest route data
        const allRoutes = await routeDataHook.fetchRouteData();
        console.log('All routes:', allRoutes);
        
        const processedData = await processRoutesData(completedRoutes, allRoutes);
        setRoutesData(processedData.routesByType);
        setChartData(processedData.chartDataArray);
        
        toast.success('Route efficiency data loaded');
      } catch (error) {
        console.error('Error fetching route data:', error);
        // Fall back to dummy data if there's an error, but ensure times are realistic
        const correctedDummyData = routeData.map(route => {
          const distance = route.distance || 20;
          return {
            ...route,
            time: Math.max(15, Math.round(distance * 1.5)) // Realistic time calculation
          };
        });
        setChartData(correctedDummyData);
      } finally {
        setLoading(false);
      }
    };
    
    if (!dataFetchAttempted) {
      fetchAllRoutesData();
    } else if (routeData.length > 0 && chartData.length === 0) {
      // Fall back to dummy data if we've attempted to fetch but have no data
      const correctedDummyData = routeData.map(route => {
        const distance = route.distance || 20;
        return {
          ...route,
          time: Math.max(15, Math.round(distance * 1.5)) // Realistic time calculation
        };
      });
      setChartData(correctedDummyData);
      setLoading(false);
    }
  }, [routeDataHook, dataFetchAttempted, routeData]);

  const handleRouteCardClick = (route: {id: string; name: string; color: string}) => {
    console.log("Route card clicked:", route);
    setSelectedRoute(route);
    setRouteAnalysisOpen(true);
  };

  const handleViewDetails = (route: {id: string; name: string; color: string}) => {
    setSelectedRoute(route);
    setRouteDetailOpen(true);
  };
  
  const handlePrintChart = () => {
    try {
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
        <RouteChart 
          chartData={chartData} 
          isLoading={loading || isLoading} 
        />
        
        <RouteCardGrid 
          routesData={routesData} 
          handleViewDetails={handleViewDetails}
          handleRouteCardClick={handleRouteCardClick}
        />
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

// Helper function to process routes data
const processRoutesData = async (completedRoutes: any[], allRoutes: any[]) => {
  import { routeLegendData, getColorClass } from '@/components/analytics/data/routeLegendData';
  
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
      
      // Ensure realistic time values - calculate based on distance
      // Average speed of 40 km/h = 2/3 km per minute
      // So, time (minutes) = distance / (2/3) = distance * 1.5
      // Minimum 15 minutes
      const distance = recentRoute.total_distance || 0;
      const calculatedTime = Math.max(15, Math.round(distance * 1.5));
      
      processedRouteData[routeType] = {
        name: recentRoute.name || routeType,
        time: calculatedTime, // Realistic time based on distance
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
      // If we don't have real data for this route, create dummy data
      const dummyDistance = 20;
      const dummyTime = Math.max(15, Math.round(dummyDistance * 1.5));
      
      const dummyRoute = {
        name: routeType,
        time: dummyTime, 
        distance: dummyDistance,
        cost: 300,
        cylinders: 25,
        routeId: `Route ${index + 1}`
      };
      
      processedRouteData[routeType] = dummyRoute;
    }
  });
  
  // Convert to array format for the chart
  const chartDataArray = Object.values(processedRouteData);
  
  return {
    routesByType: processedRouteData,
    chartDataArray
  };
};

export const getColorClass = (colorHex: string): string => {
  switch (colorHex) {
    case '#0088FE': return 'bg-blue-500';
    case '#00C49F': return 'bg-emerald-500';
    case '#FFBB28': return 'bg-amber-500';
    case '#FF8042': return 'bg-orange-500';
    case '#8884d8': return 'bg-purple-500';
    case '#82ca9d': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export default RouteEfficiencyChart;
