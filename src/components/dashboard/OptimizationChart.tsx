
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '@/components/analytics/data/routeLegendData';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { RefreshCw } from 'lucide-react';

interface OptimizationChartProps {
  data: { name: string; value: number }[];
  percentage: number;
  loadDistribution: { name: string; value: number }[];
}

const OptimizationChart: React.FC<OptimizationChartProps> = ({ 
  data, 
  percentage,
  loadDistribution 
}) => {
  const [activeChart, setActiveChart] = useState<'optimization' | 'distribution'>('optimization');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    optimizationData: data,
    loadDistributionData: loadDistribution,
    optimizationPercentage: percentage
  });
  
  const { fetchRouteData } = useRouteData();
  
  useEffect(() => {
    const calculateChartData = async () => {
      setLoading(true);
      try {
        // Fetch actual route data
        const routesData = await fetchRouteData();
        
        if (!routesData.length) {
          console.log('No routes data available for OptimizationChart');
          setLoading(false);
          return;
        }
        
        // Calculate optimization data (optimized vs standard routes)
        const optimizationStats = await calculateOptimizationStats(routesData);
        
        // Calculate load distribution (full vs partial loads)
        const loadStats = calculateLoadDistribution(routesData);
        
        setChartData({
          optimizationData: [
            { name: 'Optimized Routes', value: optimizationStats.optimized },
            { name: 'Standard Routes', value: optimizationStats.standard }
          ],
          loadDistributionData: [
            { name: 'Full Loads', value: loadStats.fullLoads },
            { name: 'Partial Loads', value: loadStats.partialLoads }
          ],
          optimizationPercentage: optimizationStats.percentage
        });
      } catch (error) {
        console.error('Error calculating chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Function to calculate optimization stats
    const calculateOptimizationStats = async (routesData: any[]) => {
      const totalRoutes = routesData.length;
      
      if (totalRoutes === 0) {
        return { optimized: 0, standard: 0, percentage: 0 };
      }
      
      // Consider routes with status 'completed' or 'in_progress' as optimized
      const optimizedRoutes = routesData.filter(
        route => route.status === 'completed' || route.status === 'in_progress'
      ).length;
      
      // Calculate standard routes (not optimized)
      const standardRoutes = totalRoutes - optimizedRoutes;
      
      // Calculate percentage of optimized routes
      const optimizationPercentage = Math.round((optimizedRoutes / totalRoutes) * 100);
      
      return {
        optimized: optimizedRoutes,
        standard: standardRoutes,
        percentage: optimizationPercentage
      };
    };
    
    // Function to calculate load distribution
    const calculateLoadDistribution = (routesData: any[]) => {
      // Define threshold for full load (20+ cylinders)
      const FULL_LOAD_THRESHOLD = 20;
      
      // Count full and partial loads
      const fullLoads = routesData.filter(route => 
        (route.total_cylinders || 0) >= FULL_LOAD_THRESHOLD
      ).length;
      
      const partialLoads = routesData.length - fullLoads;
      
      return {
        fullLoads,
        partialLoads
      };
    };
    
    calculateChartData();
  }, [fetchRouteData]);
  
  // Use the most recent data (either from props or calculated from real data)
  const displayData = loading ? 
    (activeChart === 'optimization' ? data : loadDistribution) : 
    (activeChart === 'optimization' ? chartData.optimizationData : chartData.loadDistributionData);
    
  const displayPercentage = loading ? 
    percentage : 
    (activeChart === 'optimization' ? 
      chartData.optimizationPercentage : 
      calculateDistributionPercentage(chartData.loadDistributionData));
  
  // Calculate the percentage for load distribution
  function calculateDistributionPercentage(distributionData: { name: string; value: number }[]) {
    if (!distributionData || distributionData.length < 2 || 
        (distributionData[0].value === 0 && distributionData[1].value === 0)) {
      return 0;
    }
    
    // Calculate percentage of full loads
    const fullLoads = distributionData[0].value;
    const totalLoads = distributionData[0].value + distributionData[1].value;
    
    return Math.round((fullLoads / totalLoads) * 100);
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {activeChart === 'optimization' ? 'Route Optimization' : 'Load Distribution'}
          </CardTitle>
          <Tabs 
            value={activeChart} 
            onValueChange={(value) => setActiveChart(value as 'optimization' | 'distribution')} 
            className="w-fit"
          >
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="optimization" className="text-xs px-2">Optimization</TabsTrigger>
              <TabsTrigger value="distribution" className="text-xs px-2">Distribution</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-gray-400">
          {activeChart === 'optimization' 
            ? 'Fuel efficiency improvements' 
            : 'Full vs partial load distribution'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex flex-col items-center justify-center">
          {loading ? (
            <RefreshCw className="h-10 w-10 animate-spin text-gray-400" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {displayData.map((entry, index) => (
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
                <div className="text-2xl font-bold">
                  {displayPercentage}%
                </div>
                <p className="text-xs text-gray-400">
                  {activeChart === 'optimization' 
                    ? 'Routes optimized' 
                    : 'Full load routes'}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationChart;
