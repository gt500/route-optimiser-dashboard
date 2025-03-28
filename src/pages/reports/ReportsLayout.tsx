
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ReportsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/delivery')) return 'delivery';
    if (location.pathname.includes('/maintenance')) return 'maintenance';
    return 'delivery';
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'delivery') {
      navigate('/reports/delivery/daily');
    } else if (value === 'maintenance') {
      navigate('/reports/maintenance/schedule');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View and generate detailed reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Reports</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Reports</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Outlet />
    </div>
  );
};

export default ReportsLayout;
