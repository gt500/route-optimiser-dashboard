
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RouteTabListProps {
  activeTab: string;
}

const RouteTabList: React.FC<RouteTabListProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid w-full grid-cols-3 h-11">
      <TabsTrigger value="create">Create Route</TabsTrigger>
      <TabsTrigger value="active">Active Routes</TabsTrigger>
      <TabsTrigger value="history">Route History</TabsTrigger>
    </TabsList>
  );
};

export default RouteTabList;
