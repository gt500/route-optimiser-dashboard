
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '@/components/analytics/data/routeLegendData';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // Dummy data - using the data passed as props
  const optimizationData = data || [
    { name: 'Optimized Routes', value: 65 },
    { name: 'Standard Routes', value: 35 }
  ];
  
  const distributionData = loadDistribution || [
    { name: 'Full Loads', value: 70 },
    { name: 'Partial Loads', value: 30 }
  ];
  
  // Display data based on active chart
  const displayData = activeChart === 'optimization' ? optimizationData : distributionData;
  
  // Display percentage based on active chart
  const displayPercentage = activeChart === 'optimization' ? 
    percentage : 
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
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationChart;
