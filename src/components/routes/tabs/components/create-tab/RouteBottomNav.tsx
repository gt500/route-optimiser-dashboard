
import React from 'react';
import { Button } from '@/components/ui/button';

interface RouteBottomNavProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const RouteBottomNav: React.FC<RouteBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={() => setActiveTab('details')} 
        className={`w-[49%] ${activeTab === 'details' ? 'bg-primary/10' : ''}`}
      >
        Route Details
      </Button>
      <Button 
        variant="outline" 
        onClick={() => setActiveTab('stops')} 
        className={`w-[49%] ${activeTab === 'stops' ? 'bg-primary/10' : ''}`}
      >
        Route Stops
      </Button>
    </div>
  );
};
