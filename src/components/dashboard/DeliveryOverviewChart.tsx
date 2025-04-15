
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { RefreshCw } from "lucide-react";

interface DeliveryOverviewChartProps {
  isLoading: boolean;
  weeklyDeliveryData: any;
}

const DeliveryOverviewChart: React.FC<DeliveryOverviewChartProps> = ({ 
  isLoading, 
  weeklyDeliveryData 
}) => {
  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Weekly Delivery Overview'
      }
    }
  };

  // Chart data
  const data = {
    labels: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.name) : [],
    datasets: [
      {
        label: 'Completed Deliveries',
        data: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.completed) : [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      },
      {
        label: 'Scheduled Deliveries',
        data: weeklyDeliveryData ? weeklyDeliveryData.map((day: any) => day.scheduled) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Delivery Overview</CardTitle>
        <CardDescription>A summary of deliveries completed and scheduled each day.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Bar options={options} data={data} height={300} />
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryOverviewChart;
