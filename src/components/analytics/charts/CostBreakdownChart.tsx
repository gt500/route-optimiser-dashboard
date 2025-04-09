
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { COLORS } from '../data/routeLegendData';

interface CostBreakdownChartProps {
  costBreakdown: { name: string; value: number }[];
  isLoading: boolean;
}

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({
  costBreakdown,
  isLoading
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>Distribution of operational costs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          {costBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                {isLoading ? "Loading data..." : "No cost breakdown data available for this period"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdownChart;
