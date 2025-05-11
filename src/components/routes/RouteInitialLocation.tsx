
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
    console.log("Region selection completed with:", country, region);
    
    // Call the parent handler with selected region data
    onRegionChange(country, region);
    
    // Force close the dialog
    console.log("Closing region selection dialog after selection complete");
    setRegionSelectionOpen(false);
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
