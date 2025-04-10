import React, { useState, useEffect } from 'react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Clock, 
  Fuel, 
  MapPin, 
  Package, 
  TruckIcon, 
  Route, 
  RefreshCw, 
  FileText, 
  Download,
  FileSpreadsheet,
  FileText as FilePdfIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { COLORS } from './data/routeLegendData';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { Separator } from '@/components/ui/separator';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

const FULL_LOAD_THRESHOLD = 20;

interface RouteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  routeColor: string;
}

interface RouteStats {
  day: {
    deliveries: number;
    distance: number;
    duration: number;
    cost: number;
    cylinders: number;
    fullLoads: number;
    partialLoads: number;
  };
  week: {
    deliveries: number;
    distance: number;
    duration: number;
    cost: number;
    cylinders: number;
    fullLoads: number;
    partialLoads: number;
  };
  month: {
    deliveries: number;
    distance: number;
    duration: number;
    cost: number;
    cylinders: number;
    fullLoads: number;
    partialLoads: number;
  };
  trends: {
    deliveries: 'increasing' | 'decreasing' | 'stable';
    distance: 'increasing' | 'decreasing' | 'stable';
    duration: 'increasing' | 'decreasing' | 'stable';
    cost: 'increasing' | 'decreasing' | 'stable';
  };
  timeSeriesData: {
    date: string;
    deliveries: number;
    distance: number;
    cost: number;
  }[];
  loadDistribution: {
    name: string;
    value: number;
  }[];
  comparisonToOtherRoutes: {
    metric: string;
    value: number;
    average: number;
    difference: number;
  }[];
}

const RouteDetailDialog: React.FC<RouteDetailDialogProps> = ({
  open,
  onOpenChange,
  routeId,
  routeName,
  routeColor
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const { fetchRouteData } = useRouteData();

  useEffect(() => {
    if (open) {
      const getAllRoutes = async () => {
        try {
          const routes = await fetchRouteData();
          setAllRoutes(routes);
        } catch (error) {
          console.error('Error fetching all routes:', error);
        }
      };
      
      getAllRoutes();
    }
  }, [open, fetchRouteData]);

  useEffect(() => {
    if (open && routeId && allRoutes.length > 0) {
      fetchRouteStatistics();
    }
  }, [open, routeId, period, allRoutes]);

  const fetchRouteStatistics = async () => {
    if (!open) return;
    
    setIsLoading(true);
    try {
      const routeData = allRoutes.filter(route => 
        route.name.toLowerCase().includes(routeName.toLowerCase()) || 
        route.id === routeId
      );

      if (!routeData.length) {
        console.log('No route data found for route:', routeId, routeName);
        setMockData();
        return;
      }

      const today = new Date();
      const dayAgo = subDays(today, 1);
      const weekAgo = subWeeks(today, 1);
      const monthAgo = subMonths(today, 1);

      const dayRoutes = routeData.filter(route => 
        new Date(route.date) >= dayAgo && new Date(route.date) <= today
      );
      
      const weekRoutes = routeData.filter(route => 
        new Date(route.date) >= weekAgo && new Date(route.date) <= today
      );
      
      const monthRoutes = routeData.filter(route => 
        new Date(route.date) >= monthAgo && new Date(route.date) <= today
      );

      const allDayRoutes = allRoutes.filter(route => 
        new Date(route.date) >= dayAgo && new Date(route.date) <= today
      );
      
      const allWeekRoutes = allRoutes.filter(route => 
        new Date(route.date) >= weekAgo && new Date(route.date) <= today
      );
      
      const allMonthRoutes = allRoutes.filter(route => 
        new Date(route.date) >= monthAgo && new Date(route.date) <= today
      );

      const dayAverages = calculateAverages(allDayRoutes);
      const weekAverages = calculateAverages(allWeekRoutes);
      const monthAverages = calculateAverages(allMonthRoutes);

      const timeSeriesData = weekRoutes.map(route => ({
        date: format(new Date(route.date), 'MMM dd'),
        deliveries: 1,
        distance: route.total_distance || 0,
        cost: route.estimated_cost || 0
      }));

      const fullLoadsDay = dayRoutes.filter(route => (route.total_cylinders || 0) >= FULL_LOAD_THRESHOLD).length;
      const fullLoadsWeek = weekRoutes.filter(route => (route.total_cylinders || 0) >= FULL_LOAD_THRESHOLD).length;
      const fullLoadsMonth = monthRoutes.filter(route => (route.total_cylinders || 0) >= FULL_LOAD_THRESHOLD).length;

      const dayStats = calculatePeriodStats(dayRoutes, fullLoadsDay, dayRoutes.length - fullLoadsDay);
      const weekStats = calculatePeriodStats(weekRoutes, fullLoadsWeek, weekRoutes.length - fullLoadsWeek);
      const monthStats = calculatePeriodStats(monthRoutes, fullLoadsMonth, monthRoutes.length - fullLoadsMonth);

      const prevWeekAgo = subWeeks(weekAgo, 1);
      const prevWeekRoutes = routeData.filter(route => 
        new Date(route.date) >= prevWeekAgo && new Date(route.date) < weekAgo
      );
      
      const prevWeekStats = calculatePeriodStats(prevWeekRoutes, 0, 0);
      
      const trends = {
        deliveries: calculateTrend(weekStats.deliveries, prevWeekStats.deliveries),
        distance: calculateTrend(weekStats.distance, prevWeekStats.distance),
        duration: calculateTrend(weekStats.duration, prevWeekStats.duration),
        cost: calculateTrend(weekStats.cost, prevWeekStats.cost)
      };

      const loadDistribution = [
        { name: 'Full Loads (20+ cylinders)', value: fullLoadsWeek },
        { name: 'Partial Loads (<20 cylinders)', value: weekRoutes.length - fullLoadsWeek }
      ];

      const dayComparison = createComparisonData(dayStats, dayAverages);
      const weekComparison = createComparisonData(weekStats, weekAverages);
      const monthComparison = createComparisonData(monthStats, monthAverages);

      setRouteStats({
        day: dayStats,
        week: weekStats,
        month: monthStats,
        trends,
        timeSeriesData,
        loadDistribution,
        comparisonToOtherRoutes: period === 'day' 
          ? dayComparison 
          : period === 'week' 
            ? weekComparison 
            : monthComparison
      });

    } catch (error) {
      console.error('Error fetching route statistics:', error);
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverages = (routes: any[]) => {
    if (!routes.length) {
      return {
        distance: 0,
        duration: 0,
        cost: 0
      };
    }

    const totalDistance = routes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
    const totalDuration = routes.reduce((sum, route) => sum + (route.total_duration || 0), 0);
    const totalCost = routes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
    
    return {
      distance: totalDistance / routes.length,
      duration: Math.round(totalDuration / 60 / routes.length),
      cost: totalCost / routes.length
    };
  };

  const createComparisonData = (stats: any, averages: any) => {
    return [
      { 
        metric: 'Distance (km)', 
        value: stats.distance, 
        average: averages.distance, 
        difference: stats.distance - averages.distance 
      },
      { 
        metric: 'Duration (min)', 
        value: stats.duration, 
        average: averages.duration, 
        difference: stats.duration - averages.duration 
      },
      { 
        metric: 'Cost (R)', 
        value: stats.cost, 
        average: averages.cost, 
        difference: stats.cost - averages.cost 
      }
    ];
  };

  const calculatePeriodStats = (routes: any[], fullLoads: number, partialLoads: number) => {
    const totalDistance = routes.reduce((sum, route) => sum + (route.total_distance || 0), 0);
    const totalDuration = routes.reduce((sum, route) => sum + (route.total_duration || 0), 0);
    const totalCost = routes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
    const totalCylinders = routes.reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
    
    return {
      deliveries: routes.length,
      distance: totalDistance,
      duration: Math.round(totalDuration / 60),
      cost: totalCost,
      cylinders: totalCylinders,
      fullLoads,
      partialLoads
    };
  };

  const calculateTrend = (current: number, previous: number): 'increasing' | 'decreasing' | 'stable' => {
    if (previous === 0) return 'stable';
    const percentChange = ((current - previous) / previous) * 100;
    
    if (percentChange > 5) return 'increasing';
    if (percentChange < -5) return 'decreasing';
    return 'stable';
  };

  const setMockData = () => {
    const baseMockStats = {
      day: {
        deliveries: 2,
        distance: 48,
        duration: 67,
        cost: 340,
        cylinders: 42,
        fullLoads: 1,
        partialLoads: 1
      },
      week: {
        deliveries: 10,
        distance: 287,
        duration: 385,
        cost: 1870,
        cylinders: 185,
        fullLoads: 6,
        partialLoads: 4
      },
      month: {
        deliveries: 42,
        distance: 1245,
        duration: 1680,
        cost: 8350,
        cylinders: 830,
        fullLoads: 28,
        partialLoads: 14
      }
    };

    const mockAverages = {
      day: {
        distance: 38,
        duration: 58,
        cost: 310
      },
      week: {
        distance: 245,
        duration: 420,
        cost: 1750
      },
      month: {
        distance: 1100,
        duration: 1450,
        cost: 7800
      }
    };

    const dayComparison = [
      { metric: 'Distance (km)', value: 48, average: 38, difference: 10 },
      { metric: 'Duration (min)', value: 67, average: 58, difference: 9 },
      { metric: 'Cost (R)', value: 340, average: 310, difference: 30 }
    ];

    const weekComparison = [
      { metric: 'Distance (km)', value: 287, average: 245, difference: 42 },
      { metric: 'Duration (min)', value: 385, average: 420, difference: -35 },
      { metric: 'Cost (R)', value: 1870, average: 1750, difference: 120 }
    ];

    const monthComparison = [
      { metric: 'Distance (km)', value: 1245, average: 1100, difference: 145 },
      { metric: 'Duration (min)', value: 1680, average: 1450, difference: 230 },
      { metric: 'Cost (R)', value: 8350, average: 7800, difference: 550 }
    ];

    const mockComparison = period === 'day' 
      ? dayComparison 
      : period === 'week' 
        ? weekComparison 
        : monthComparison;
    
    const mockStats: RouteStats = {
      ...baseMockStats,
      trends: {
        deliveries: 'increasing',
        distance: 'stable',
        duration: 'decreasing',
        cost: 'increasing'
      },
      timeSeriesData: [
        { date: 'May 01', deliveries: 1, distance: 42, cost: 280 },
        { date: 'May 02', deliveries: 2, distance: 65, cost: 420 },
        { date: 'May 03', deliveries: 1, distance: 38, cost: 250 },
        { date: 'May 04', deliveries: 0, distance: 0, cost: 0 },
        { date: 'May 05', deliveries: 2, distance: 58, cost: 370 },
        { date: 'May 06', deliveries: 3, distance: 72, cost: 460 },
        { date: 'May 07', deliveries: 1, distance: 36, cost: 230 }
      ],
      loadDistribution: [
        { name: 'Full Loads (20+ cylinders)', value: 6 },
        { name: 'Partial Loads (<20 cylinders)', value: 4 }
      ],
      comparisonToOtherRoutes: mockComparison
    };
    
    setRouteStats(mockStats);
  };

  const currentStats = routeStats ? routeStats[period] : null;

  const renderTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable', isGoodTrend: boolean = true) => {
    if (trend === 'increasing') {
      return <ArrowUp className={`h-4 w-4 ${isGoodTrend ? 'text-green-500' : 'text-red-500'}`} />;
    } else if (trend === 'decreasing') {
      return <ArrowDown className={`h-4 w-4 ${isGoodTrend ? 'text-green-500' : 'text-red-500'}`} />;
    }
    return null;
  };

  const handleExportData = (format: 'excel' | 'pdf') => {
    if (!routeStats || !currentStats) {
      toast.error('No data available to export');
      return;
    }

    const exportData = [
      {
        siteName: routeName,
        deliveries: currentStats.deliveries,
        cylinders: currentStats.cylinders,
        kms: currentStats.distance,
        fuelCost: currentStats.cost,
        fullLoads: currentStats.fullLoads,
        partialLoads: currentStats.partialLoads,
        duration: currentStats.duration
      }
    ];

    try {
      if (format === 'excel') {
        exportToExcel(exportData, `${routeName.replace(/\s/g, '_')}_${period}_data`);
        toast.success('Data exported to Excel successfully');
      } else {
        exportToPDF(
          exportData, 
          `${routeName.replace(/\s/g, '_')}_${period}_data`,
          `${routeName} Route Analysis - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
          new Date()
        );
        toast.success('Data exported to PDF successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${routeColor}`}></div>
            <span>{routeName}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed performance analytics for {routeId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : routeStats ? (
          <div className="space-y-6">
            <Tabs 
              defaultValue="week" 
              className="w-full"
              onValueChange={(value) => setPeriod(value as 'day' | 'week' | 'month')}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">
                  Last 24 Hours
                </TabsTrigger>
                <TabsTrigger value="week">
                  Last 7 Days
                </TabsTrigger>
                <TabsTrigger value="month">
                  Last Month
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {routeName} has completed <span className="font-medium">{currentStats?.deliveries}</span> deliveries in the selected time period, 
                  covering <span className="font-medium">{currentStats?.distance.toFixed(1)} km</span> at a cost of 
                  <span className="font-medium"> R{currentStats?.cost.toFixed(2)}</span>.
                  
                  {routeStats.trends.deliveries !== 'stable' && (
                    <span>
                      {' '}Delivery volume is {routeStats.trends.deliveries} compared to the previous period.
                    </span>
                  )}
                  
                  {routeStats.trends.cost !== 'stable' && (
                    <span>
                      {' '}Cost per delivery is {routeStats.trends.cost === 'increasing' ? 'rising' : 'reducing'}.
                    </span>
                  )}
                  
                  {currentStats && currentStats.fullLoads > currentStats.partialLoads ? (
                    <span>
                      {' '}This route primarily serves full load deliveries (20+ cylinders), suggesting efficient route planning.
                    </span>
                  ) : (
                    <span>
                      {' '}This route has more partial load deliveries (&lt;20 cylinders), suggesting more frequent replenishments.
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        Deliveries
                      </p>
                      <h3 className="text-2xl font-bold mt-1">{currentStats?.deliveries}</h3>
                    </div>
                    {renderTrendIcon(routeStats.trends.deliveries, true)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Distance
                      </p>
                      <h3 className="text-2xl font-bold mt-1">{currentStats?.distance.toFixed(1)} km</h3>
                    </div>
                    {renderTrendIcon(routeStats.trends.distance, false)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Duration
                      </p>
                      <h3 className="text-2xl font-bold mt-1">{currentStats?.duration} min</h3>
                    </div>
                    {renderTrendIcon(routeStats.trends.duration, false)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        Cost
                      </p>
                      <h3 className="text-2xl font-bold mt-1">R{currentStats?.cost.toFixed(2)}</h3>
                    </div>
                    {renderTrendIcon(routeStats.trends.cost, false)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Delivery Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={routeStats.timeSeriesData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }} 
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="distance" 
                          name="Distance (km)" 
                          stroke={COLORS[0]} 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="cost" 
                          name="Cost (R)" 
                          stroke={COLORS[2]} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Load Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={routeStats.loadDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {routeStats.loadDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }} 
                          formatter={(value: number) => [`${value} deliveries`, 'Quantity']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Comparison to Other Routes ({period === 'day' ? 'Last 24 Hours' : period === 'week' ? 'Last 7 Days' : 'Last Month'})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeStats.comparisonToOtherRoutes.map((comparison, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{comparison.metric}</span>
                        <span className="text-sm">
                          {comparison.value.toFixed(1)} vs. avg {comparison.average.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${comparison.difference > 0 ? 'bg-blue-500' : 'bg-green-500'}`}
                          style={{ 
                            width: `${Math.min(Math.abs(comparison.difference / comparison.average) * 100 + 50, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {comparison.difference > 0 
                          ? `${comparison.difference.toFixed(1)} higher than average` 
                          : `${Math.abs(comparison.difference).toFixed(1)} lower than average`}
                      </p>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportData('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    <span>Export to Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                    <FilePdfIcon className="h-4 w-4 mr-2" />
                    <span>Export to PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <p>No data available for this route.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailDialog;
