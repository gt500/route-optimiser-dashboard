
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { RefreshCw } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DeliveryOverviewChartProps {
  isLoading: boolean;
  weeklyDeliveryData: any;
}

const DeliveryOverviewChart: React.FC<DeliveryOverviewChartProps> = ({ 
  isLoading, 
  weeklyDeliveryData 
}) => {
  const chartRef = useRef<ChartJS>(null);

  // Clear chart instance on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

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
    },
    scales: {
      x: {
        type: 'category' as const,
      },
      y: {
        beginAtZero: true,
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
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            <Bar 
              options={options} 
              data={data} 
              ref={chartRef}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryOverviewChart;
