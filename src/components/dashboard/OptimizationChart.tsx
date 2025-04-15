
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '@/components/analytics/data/routeLegendData';
import { Button } from '@/components/ui/button';
import { Route, Package } from 'lucide-react';
import { FULL_LOAD_PER_SITE } from '@/hooks/delivery/types';
import { useRouteData } from '@/hooks/fleet/useRouteData';

interface OptimizationChartProps {
  data?: { name: string; value: number }[];
  percentage?: number;
  loadDistribution?: { name: string; value: number }[];
}

const OptimizationChart: React.FC<OptimizationChartProps> = ({ 
  data: initialData, 
  percentage: initialPercentage,
  loadDistribution: initialLoadDistribution 
}) => {
  const [activeChart, setActiveChart] = useState<'optimization' | 'distribution'>('optimization');
  const [optimizationData, setOptimizationData] = useState<{ name: string; value: number }[]>([]);
  const [distributionData, setDistributionData] = useState<{ name: string; value: number }[]>([]);
  const [optimizationPercentage, setOptimizationPercentage] = useState(0);
  const routeDataHook = useRouteData();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch actual route data
        const routes = await routeDataHook.fetchRouteData();
        
        // Calculate optimization data
        // Count optimized vs standard routes
        // Assuming optimized routes are ones with estimated_cost that shows fuel savings
        const optimizedRoutes = routes.filter(route => route.estimated_cost && route.total_distance && (route.estimated_cost / route.total_distance < 5));
        const standardRoutes = routes.filter(route => !optimizedRoutes.includes(route));
        
        const optData = [
          { name: 'Optimized Routes', value: optimizedRoutes.length },
          { name: 'Standard Routes', value: standardRoutes.length }
        ];
        
        // Calculate load distribution
        // Count full loads vs partial loads
        const fullLoads = routes.filter(route => route.total_cylinders >= FULL_LOAD_PER_SITE).length;
        const partialLoads = routes.length - fullLoads;
        
        const loadData = [
          { name: 'Full Loads', value: fullLoads },
          { name: 'Partial Loads', value: partialLoads }
        ];
        
        // Calculate optimization percentage
        const percent = optimizedRoutes.length > 0 
          ? Math.round((optimizedRoutes.length / routes.length) * 100) 
          : 0;
        
        // Update state with real data
        setOptimizationData(optData);
        setDistributionData(loadData);
        setOptimizationPercentage(percent);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // If there's an error, use provided data or defaults
        setOptimizationData(initialData || [
          { name: 'Optimized Routes', value: 65 },
          { name: 'Standard Routes', value: 35 }
        ]);
        setDistributionData(initialLoadDistribution || [
          { name: 'Full Loads', value: 70 },
          { name: 'Partial Loads', value: 30 }
        ]);
        setOptimizationPercentage(initialPercentage || 65);
      }
    };

    fetchChartData();
  }, [initialData, initialPercentage, initialLoadDistribution]);
  
  // Display data based on active chart
  const displayData = activeChart === 'optimization' ? optimizationData : distributionData;
  
  // Display percentage based on active chart
  const displayPercentage = activeChart === 'optimization' ? 
    optimizationPercentage : 
    calculateDistributionPercentage(distributionData);
  
  // Calculate percentage for distribution
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
        <div className="flex justify-between items-start">
          <CardTitle>
            {activeChart === 'optimization' ? 'Route Optimization' : 'Load Distribution'}
          </CardTitle>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="default"
              size="sm"
              onClick={() => setActiveChart('optimization')}
              className={`h-8 px-3 text-xs flex items-center gap-1 w-full ${activeChart !== 'optimization' && 'bg-transparent text-white hover:bg-gray-800 border border-gray-700'}`}
            >
              <Route className="h-3 w-3" />
              Optimization
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setActiveChart('distribution')}
              className={`h-8 px-3 text-xs flex items-center gap-1 w-full ${activeChart !== 'distribution' && 'bg-transparent text-white hover:bg-gray-800 border border-gray-700'}`}
            >
              <Package className="h-3 w-3" />
              Distribution
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          {activeChart === 'optimization' 
            ? 'Fuel efficiency improvements' 
            : `Sites with ${FULL_LOAD_PER_SITE}+ cylinders are full loads`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex flex-col items-center justify-center">
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
                : 'Sites with full loads'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationChart;
