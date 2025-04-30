
import React, { useState, useEffect } from 'react';
import RegionSelectionDialog from '@/components/routes/RegionSelectionDialog';

interface RouteInitialLocationProps {
  activeTab: string;
  isLoadConfirmed: boolean;
  regionSelectionOpen: boolean;
  setRegionSelectionOpen: (open: boolean) => void;
  onRegionChange: (country: string, region: string) => void;
}

const RouteInitialLocation: React.FC<RouteInitialLocationProps> = ({
  activeTab,
  isLoadConfirmed,
  regionSelectionOpen,
  setRegionSelectionOpen,
  onRegionChange
}) => {
  // Open region selection dialog when on create tab and not confirmed
  useEffect(() => {
    if (activeTab === 'create' && !isLoadConfirmed && !regionSelectionOpen) {
      setRegionSelectionOpen(true);
    }
  }, [activeTab, isLoadConfirmed, regionSelectionOpen]);

  return (
    <RegionSelectionDialog
      open={regionSelectionOpen}
      onOpenChange={setRegionSelectionOpen}
      onComplete={onRegionChange}
    />
  );
};

export default RouteInitialLocation;
