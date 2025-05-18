
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
    if (activeTab === 'create' && !isLoadConfirmed) {
      console.log("Opening region selection dialog from useEffect in RouteInitialLocation");
      // Use a slight delay to ensure state is properly set
      const timer = setTimeout(() => {
        setRegionSelectionOpen(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, isLoadConfirmed, setRegionSelectionOpen]);

  const handleRegionComplete = (country: string, region: string) => {
    console.log("Region selection completed in RouteInitialLocation with:", country, region);
    
    if (!country || !region) {
      console.error("Invalid region selection values:", { country, region });
      return;
    }
    
    // First invoke the callback to update the state
    onRegionChange(country, region);
    
    console.log("Region change propagated to parent from RouteInitialLocation");
    
    // Clear the dialog state after a short delay to ensure state updates properly
    setTimeout(() => {
      setRegionSelectionOpen(false);
    }, 100);
  };

  return (
    <RegionSelectionDialog
      open={regionSelectionOpen}
      onOpenChange={(open) => {
        console.log("RegionSelectionDialog onOpenChange called with:", open);
        setRegionSelectionOpen(open);
      }}
      onComplete={handleRegionComplete}
    />
  );
};

export default RouteInitialLocation;
