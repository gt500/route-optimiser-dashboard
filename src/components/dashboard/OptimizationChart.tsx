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
        const routes = await routeDataHook.fetchRouteData();
        
        const processedRoutes = routes.map(route => {
          let processedDuration = route.total_duration;
          
          if (!processedDuration || processedDuration < 15 * 60) {
            const distance = route.total_distance || 0;
            const stops = 3;
            const drivingTimeMinutes = (distance / 40) * 60;
            const stopTimeMinutes = stops * 15;
            processedDuration = Math.max(15 * 60, (drivingTimeMinutes + stopTimeMinutes) * 60);
          }
          
          return {
            ...route,
            total_duration: processedDuration
          };
        });
        
        const optimizedRoutes = processedRoutes.filter(route => route.estimated_cost && route.total_distance && (route.estimated_cost / route.total_distance < 5));
        const standardRoutes = processedRoutes.filter(route => !optimizedRoutes.includes(route));
        
        const optData = [
          { name: 'Optimized Routes', value: optimizedRoutes.length },
          { name: 'Standard Routes', value: standardRoutes.length }
        ];
        
        const fullLoads = processedRoutes.filter(route => route.total_cylinders >= FULL_LOAD_PER_SITE).length;
        const partialLoads = processedRoutes.length - fullLoads;
        
        const loadData = [
          { name: 'Full Loads', value: fullLoads },
          { name: 'Partial Loads', value: partialLoads }
        ];
        
        const percent = optimizedRoutes.length > 0 
          ? Math.round((optimizedRoutes.length / processedRoutes.length) * 100) 
          : 0;
        
        setOptimizationData(optData);
        setDistributionData(loadData);
        setOptimizationPercentage(percent);
      } catch (error) {
        console.error("Error fetching chart data:", error);
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
  
  const displayData = activeChart === 'optimization' ? optimizationData : distributionData;
  
  const displayPercentage = activeChart === 'optimization' ? 
    optimizationPercentage : 
    calculateDistributionPercentage(distributionData);
  
  function calculateDistributionPercentage(distributionData: { name: string; value: number }[]) {
    if (!distributionData || distributionData.length < 2 || 
        (distributionData[0].value === 0 && distributionData[1].value === 0)) {
      return 0;
    }
    
    const fullLoads = distributionData[0].value;
    const totalLoads = distributionData[0].value + distributionData[1].value;
    
    return Math.round((fullLoads / totalLoads) * 100);
  }
  
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col gap-1 mt-2" style={{ fontSize: '12px', margin: 0, padding: 0, listStyle: 'none', lineHeight: 1.25 }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 text-white" style={{ color: entry.color }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              display: 'inline-block',
              backgroundColor: entry.color,
              marginRight: 4,
              border: '1px solid #e8e8e8'
            }} />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

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
              <Legend verticalAlign="bottom" align="center" iconSize={12} content={renderCustomLegend} />
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
