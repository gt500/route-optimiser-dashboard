
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface ReportTabsProps {
  defaultValue: string;
}

const ReportTabs: React.FC<ReportTabsProps> = ({ defaultValue }) => {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'daily':
        navigate('/reports/delivery/daily');
        break;
      case 'weekly':
        navigate('/reports/delivery/weekly');
        break;
      case 'monthly':
        navigate('/reports/delivery/monthly');
        break;
      default:
        break;
    }
  };

  return (
    <Tabs defaultValue={defaultValue} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ReportTabs;
