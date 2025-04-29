
import { useState } from 'react';
import { MaintenanceItem, MaintenanceTask, FixedCost, MaintenanceBudget, MaintenanceTimeline, Vehicle } from '@/types/fleet';
import { toast } from 'sonner';
import { useVehiclesData } from './useVehiclesData';
import { format, addDays, addMonths, differenceInDays, parseISO } from 'date-fns';

const monthlyTasks: MaintenanceTask[] = [
  { 
    task: 'Diesel Refuel', 
    frequency: 'Monthly', 
    cost: 15488, 
    notes: 'Track fuel efficiency',
    category: 'Monthly'
  },
  { 
    task: 'Miscellaneous', 
    frequency: 'Monthly', 
    cost: 800, 
    notes: 'Car wash, minor repairs',
    category: 'Monthly'
  },
  { 
    task: 'Fixed Costs', 
    frequency: 'Monthly', 
    cost: 31244, 
    notes: 'See fixed costs table',
    category: 'Monthly'
  }
];

const quarterlyTasks: MaintenanceTask[] = [
  { 
    task: 'Tyres', 
    frequency: 'Every 5 months', 
    cost: 2115, 
    notes: 'Time-based replacement',
    category: 'Quarterly'
  },
  { 
    task: 'Minor Service', 
    frequency: 'Every 15,000 km', 
    cost: 5000, 
    triggerPoint: '~2.1 months (7,040 km/month)',
    category: 'Distance'
  },
  { 
    task: 'Major Service', 
    frequency: 'Every 45,000 km', 
    cost: 5000, 
    triggerPoint: '~6.4 months',
    category: 'Distance'
  }
];

const fixedCosts: FixedCost[] = [
  { type: 'Tracker', description: 'Vehicle', cost: 200 },
  { type: 'Insurance', description: 'Vehicle', cost: 2000 },
  { type: 'Insurance', description: 'Goods in Transit', cost: 400 },
  { type: 'Insurance', description: 'Chemical Clean Up', cost: 1000 },
  { type: 'Driver', description: 'Salary', cost: 10000 },
  { type: 'Manager', description: 'Salary', cost: 14000 },
  { type: 'Uniform', description: '', cost: 219 },
  { type: 'Meals', description: '', cost: 1500 },
  { type: 'MobiClock Pro', description: '', cost: 1500 },
  { type: 'SIM Card', description: '', cost: 300 },
  { type: 'Registration', description: 'Vehicle', cost: 125 }
];

const budgetSummary: MaintenanceBudget[] = [
  { category: 'Variable Costs', monthlyCost: 21320, annualCost: 255840 },
  { category: 'Fixed Costs', monthlyCost: 31244, annualCost: 374928 },
  { category: 'Total', monthlyCost: 52564, annualCost: 630768 }
];

const sampleTimeline: MaintenanceTimeline[] = [
  { month: 1, tasks: ['Minor Service', 'Fixed Costs'], estimatedCost: 36244 },
  { month: 2, tasks: ['Fixed Costs Only'], estimatedCost: 31244 },
  { month: 3, tasks: ['Tyres', 'Fixed Costs'], estimatedCost: 33359 },
  { month: 4, tasks: ['Minor Service', 'Fixed Costs'], estimatedCost: 36244 },
  { month: 5, tasks: ['Fixed Costs Only'], estimatedCost: 31244 },
  { month: 6, tasks: ['Major Service', 'Tyres', 'Fixed Costs'], estimatedCost: 38359 }
];

export const useMaintenanceData = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const { vehicles } = useVehiclesData();

  // New start date: May 2nd, 2025
  const MAINTENANCE_START_DATE = '2025-05-02';
  
  const predictMaintenanceDate = (vehicle: Vehicle, taskType: string): Date => {
    const startDate = new Date(MAINTENANCE_START_DATE);

    switch(taskType) {
      case 'Tyres':
        return addDays(startDate, 150);
      case 'Minor Service':
        return addDays(startDate, 64);
      case 'Major Service':
        return addDays(startDate, 192);
      case 'Diesel Refuel':
        return addDays(startDate, 7);
      default:
        return addMonths(startDate, 1);
    }
  };

  const getDaysUntilMaintenance = (date: Date): number => {
    const today = new Date();
    return differenceInDays(date, today);
  };

  const fetchMaintenanceItems = async () => {
    try {
      const maintenanceSchedule: MaintenanceItem[] = [];

      vehicles.forEach(vehicle => {
        const nextTyreDate = predictMaintenanceDate(vehicle, 'Tyres');
        maintenanceSchedule.push({
          vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
          vehicleId: vehicle.id,
          type: 'Tyres',
          category: 'Quarterly',
          date: format(nextTyreDate, 'yyyy-MM-dd'),
          status: 'Scheduled',
          cost: 2115,
          notes: `Due in ${getDaysUntilMaintenance(nextTyreDate)} days`
        });

        const nextMinorServiceDate = predictMaintenanceDate(vehicle, 'Minor Service');
        maintenanceSchedule.push({
          vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
          vehicleId: vehicle.id,
          type: 'Minor Service',
          category: 'Distance',
          date: format(nextMinorServiceDate, 'yyyy-MM-dd'),
          status: vehicle.status === 'Maintenance' ? 'In Progress' : 'Scheduled',
          cost: 5000,
          notes: `Due in ${getDaysUntilMaintenance(nextMinorServiceDate)} days`
        });

        const nextMajorServiceDate = predictMaintenanceDate(vehicle, 'Major Service');
        maintenanceSchedule.push({
          vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
          vehicleId: vehicle.id,
          type: 'Major Service',
          category: 'Distance',
          date: format(nextMajorServiceDate, 'yyyy-MM-dd'),
          status: 'Scheduled',
          cost: 5000,
          notes: `Due in ${getDaysUntilMaintenance(nextMajorServiceDate)} days`
        });

        const nextRefuelDate = predictMaintenanceDate(vehicle, 'Diesel Refuel');
        maintenanceSchedule.push({
          vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
          vehicleId: vehicle.id,
          type: 'Diesel Refuel',
          category: 'Monthly',
          date: format(nextRefuelDate, 'yyyy-MM-dd'),
          status: 'Scheduled',
          cost: 15488 / 4,
          notes: `Due in ${getDaysUntilMaintenance(nextRefuelDate)} days`
        });
      });

      maintenanceSchedule.sort((a, b) => {
        return parseISO(a.date).getTime() - parseISO(b.date).getTime();
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
    monthlyTasks,
    quarterlyTasks,
    fixedCosts,
    budgetSummary,
    sampleTimeline
  };
};
