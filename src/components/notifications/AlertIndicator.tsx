
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { triggerLowStockCheck } from '@/pages/MachineTriggers';

// Create a global variable to track alert status across the application
let globalHasAlert = false;

// Create a setter function that components can call to update the alert status
export const setGlobalAlertStatus = (hasAlert: boolean) => {
  globalHasAlert = hasAlert;
  // Dispatch a custom event to notify all instances of the component
  window.dispatchEvent(new CustomEvent('alertStatusChanged', { detail: { hasAlert } }));
};

export const AlertIndicator = () => {
  const [hasAlert, setHasAlert] = useState(globalHasAlert);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for changes to the global alert status
  useEffect(() => {
    const handleAlertStatusChange = (e: CustomEvent<{ hasAlert: boolean }>) => {
      setHasAlert(e.detail.hasAlert);
    };

    // Check for alerts on mount
    triggerLowStockCheck();

    // Add event listener for alert status changes
    window.addEventListener('alertStatusChanged', handleAlertStatusChange as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('alertStatusChanged', handleAlertStatusChange as EventListener);
    };
  }, []);

  const handleClick = () => {
    navigate('/machine-triggers');
    toast({
      title: "Viewing Alerts",
      description: "Navigating to machine triggers page",
    });
  };

  if (!hasAlert) return null;

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative rounded-full text-destructive animate-pulse"
      onClick={handleClick}
      title="Machine alert detected! Click to view"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
    </Button>
  );
};
