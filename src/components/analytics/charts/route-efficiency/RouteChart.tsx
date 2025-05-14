
import React from 'react';
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
import { RefreshCw } from 'lucide-react';
import { FULL_LOAD_PER_SITE } from '@/hooks/delivery/types';

interface RouteChartProps {
  chartData: any[];
  isLoading: boolean;
}

export const RouteChart: React.FC<RouteChartProps> = ({ chartData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-muted-foreground">No route data available</p>
      </div>
    );
  }

  return (
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
              if (name === 'time') {
                return [`${value} min`, 'Time'];
              }
              if (name === 'distance') {
                return [`${value} km`, 'Distance'];
              }
              if (name === 'cost') {
                return [`R${value}`, 'Cost'];
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
  );
};
