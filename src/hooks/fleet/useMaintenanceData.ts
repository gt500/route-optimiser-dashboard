
import { useState } from 'react';
import { MaintenanceItem, MaintenanceTask, FixedCost, MaintenanceBudget, MaintenanceTimeline, Vehicle } from '@/types/fleet';
import { toast } from 'sonner';
import { useVehiclesData } from './useVehiclesData';
import { format, addDays, addMonths } from 'date-fns';

// Maintenance tasks data from the provided template
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
  
  // Fetch maintenance data with the new structure
  const fetchMaintenanceItems = async () => {
    try {
      // Generate maintenance schedule based on vehicle data and the provided template
      const today = new Date();
      const maintenanceSchedule: MaintenanceItem[] = [];
      
      // Use actual vehicle data to create maintenance schedules
      vehicles.forEach(vehicle => {
        // Get last service date
        const lastServiceDate = new Date(vehicle.lastService);
        const daysSinceLastService = Math.floor((today.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Add monthly tasks for this vehicle
        monthlyTasks.forEach(task => {
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            vehicleId: vehicle.id,
            type: task.task,
            category: task.category,
            date: format(today, 'yyyy-MM-dd'),
            status: 'Scheduled',
            cost: task.cost,
            notes: task.notes
          });
        });
        
        // Add tire replacement (every 5 months)
        if (daysSinceLastService > 140) { // ~5 months
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            vehicleId: vehicle.id,
            type: 'Tyres',
            category: 'Quarterly',
            date: format(addDays(today, 14), 'yyyy-MM-dd'),
            status: 'Scheduled',
            cost: 2115,
            notes: 'Time-based replacement'
          });
        }
        
        // Add minor service (every 15,000 km)
        // Assuming average 7,040 km per month
        const estimatedKm = vehicle.odometer || 0;
        const lastServiceKm = vehicle.lastServiceKm || 0;
        const kmSinceLastService = estimatedKm - lastServiceKm;
        
        if (kmSinceLastService > 12000 || daysSinceLastService > 60) { // ~2 months
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            vehicleId: vehicle.id,
            type: 'Minor Service',
            category: 'Distance',
            date: format(addDays(today, 7), 'yyyy-MM-dd'),
            status: vehicle.status === 'Maintenance' ? 'In Progress' : 'Scheduled',
            cost: 5000,
            triggerPoint: 'Every 15,000 km'
          });
        }
        
        // Add major service (every 45,000 km)
        if (kmSinceLastService > 40000 || daysSinceLastService > 180) { // ~6 months
          maintenanceSchedule.push({
            vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
            vehicleId: vehicle.id,
            type: 'Major Service',
            category: 'Distance',
            date: format(addDays(today, 21), 'yyyy-MM-dd'),
            status: 'Scheduled',
            cost: 5000,
            triggerPoint: 'Every 45,000 km'
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
    monthlyTasks,
    quarterlyTasks,
    fixedCosts,
    budgetSummary,
    sampleTimeline
  };
};
