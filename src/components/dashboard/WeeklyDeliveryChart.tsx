
import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';

interface WeeklyDeliveryChartProps {
  data: { name: string; deliveries: number }[];
}

const WeeklyDeliveryChart: React.FC<WeeklyDeliveryChartProps> = ({ data }) => {
  return (
    <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Weekly Deliveries</CardTitle>
          <p className="text-sm text-gray-400">Overview of deliveries this week</p>
        </div>
        <BarChartIcon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }} 
              />
              <Bar dataKey="deliveries" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDeliveryChart;
