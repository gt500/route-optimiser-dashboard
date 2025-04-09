
import { useState } from 'react';
import { MaintenanceItem } from '@/types/fleet';
import { toast } from 'sonner';
import { useVehiclesData } from './useVehiclesData';
import { format, addDays } from 'date-fns';

export const useMaintenanceData = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const { vehicles } = useVehiclesData();

  // Fetch maintenance data
  const fetchMaintenanceItems = async () => {
    try {
      // Generate maintenance schedule based on vehicle data and cost parameters
      const today = new Date();
      const maintenanceSchedule: MaintenanceItem[] = [];
      
      // Use actual vehicle data to create maintenance schedules
      vehicles.forEach(vehicle => {
        // Get last service date
        const lastServiceDate = new Date(vehicle.lastService);
        const daysSinceLastService = Math.floor((today.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Parameters from cost analysis:
        // - Minor service every 15,000km (approx every 3 months)
        // - Major service every 45,000km (approx every 9 months)
        // - Tire replacement every 4-5 months
        
        // Add minor service if it's been more than 85 days (around 3 months)
        if (daysSinceLastService > 85) {
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            type: 'Minor Service',
            date: format(today, 'yyyy-MM-dd'),
            status: vehicle.status === 'Maintenance' ? 'In Progress' : 'Scheduled'
          });
        }
        
        // Add major service if it's been more than 260 days (around 9 months)
        if (daysSinceLastService > 260) {
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            type: 'Major Service',
            date: format(addDays(today, 2), 'yyyy-MM-dd'),
            status: 'Scheduled'
          });
        }
        
        // Add tire replacement if it's been more than 120 days (4 months)
        if (daysSinceLastService > 120) {
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            type: 'Tire Replacement',
            date: format(addDays(today, 5), 'yyyy-MM-dd'),
            status: 'Scheduled'
          });
        }
      });
      
      setMaintenanceItems(maintenanceSchedule);
      return maintenanceSchedule;
    } catch (error) {
      console.error('Error generating maintenance data:', error);
      toast.error('Failed to generate maintenance data');
      return [];
    }
  };

  return {
    maintenanceItems,
    fetchMaintenanceItems,
  };
};
