
import React from 'react';
import { Card } from '@/components/ui/card';
import { Outlet, useLocation } from 'react-router-dom';

const ReportsLayout = () => {
  const location = useLocation();
  
  // Determine the current report type from the URL
  const getReportTitle = () => {
    if (location.pathname.includes('/delivery/daily')) {
      return 'Daily Delivery Reports';
    } else if (location.pathname.includes('/delivery/weekly')) {
      return 'Weekly Delivery Reports';
    } else if (location.pathname.includes('/delivery/monthly')) {
      return 'Monthly Delivery Reports';
    }
    return 'Reports';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{getReportTitle()}</h1>
        <p className="text-muted-foreground">View and generate detailed reports</p>
      </div>
      
      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  );
};

export default ReportsLayout;
