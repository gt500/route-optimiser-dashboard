
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
      console.log("Opening region selection dialog from useEffect");
      setRegionSelectionOpen(true);
    }
  }, [activeTab, isLoadConfirmed, regionSelectionOpen, setRegionSelectionOpen]);

  const handleRegionComplete = (country: string, region: string) => {
    console.log("Region selection completed with:", country, region);
    onRegionChange(country, region);
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
