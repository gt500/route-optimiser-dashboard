
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface OptimizationChartProps {
  data: { name: string; value: number }[];
  percentage: number;
}

const OptimizationChart: React.FC<OptimizationChartProps> = ({ data, percentage }) => {
  const COLORS = ['#0088FE', '#8B5CF6'];

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <CardTitle>Route Optimization</CardTitle>
        <p className="text-sm text-gray-400">Fuel efficiency improvements</p>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
              {percentage}%
            </div>
            <p className="text-xs text-gray-400">Routes optimized</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationChart;
