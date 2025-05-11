
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
      setRegionSelectionOpen(true);
    }
  }, [activeTab, isLoadConfirmed, regionSelectionOpen, setRegionSelectionOpen]);

  const handleRegionComplete = (country: string, region: string) => {
    console.log("Region selection completed in RouteInitialLocation with:", country, region);
    
    if (!country || !region) {
      console.error("Invalid region selection values:", { country, region });
      return;
    }
    
    // First close the dialog to ensure UI updates properly
    setRegionSelectionOpen(false);
    
    // Then call the parent handler with selected region data with a small delay
    // This ensures the dialog closing animation completes before the next state update
    setTimeout(() => {
      onRegionChange(country, region);
      console.log("Region change propagated to parent from RouteInitialLocation");
    }, 100);
  };

  return (
    <RegionSelectionDialog
      open={regionSelectionOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange called with:", open);
        setRegionSelectionOpen(open);
      }}
      onComplete={handleRegionComplete}
    />
  );
};

export default RouteInitialLocation;
