
import React, { useEffect } from 'react';
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
      console.log("Opening region selection dialog from useEffect in RouteInitialLocation");
      setTimeout(() => {
        setRegionSelectionOpen(true);
      }, 100);
    }
  }, [activeTab, isLoadConfirmed, regionSelectionOpen, setRegionSelectionOpen]);

  const handleRegionComplete = (country: string, region: string) => {
    console.log("Region selection completed in RouteInitialLocation with:", country, region);
    
    if (!country || !region) {
      console.error("Invalid region selection values:", { country, region });
      return;
    }
    
    // Handle the region change
    onRegionChange(country, region);
    console.log("Region change propagated to parent from RouteInitialLocation");
  };

  return (
    <RegionSelectionDialog
      open={regionSelectionOpen}
      onOpenChange={setRegionSelectionOpen}
      onComplete={handleRegionComplete}
    />
  );
};

export default RouteInitialLocation;
