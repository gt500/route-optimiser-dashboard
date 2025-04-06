
import { useState } from 'react';
import { MaintenanceItem } from '@/types/fleet';
import { toast } from 'sonner';

export const useMaintenanceData = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);

  // Fetch maintenance data
  const fetchMaintenanceItems = async () => {
    try {
      // In the future, fetch from maintenance table
      // For now, use static data
      const maintenanceSchedule: MaintenanceItem[] = [
        { vehicle: 'Leyland Phoenix (CA 123-456)', type: 'Engine Service', date: '2023-12-05', status: 'In Progress' },
        { vehicle: 'Leyland Phoenix (CA 789-012)', type: 'Tire Replacement', date: '2023-12-12', status: 'Scheduled' },
      ];
      
      setMaintenanceItems(maintenanceSchedule);
      return maintenanceSchedule;
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to load maintenance data');
      return [];
    }
  };

  return {
    maintenanceItems,
    fetchMaintenanceItems,
  };
};
