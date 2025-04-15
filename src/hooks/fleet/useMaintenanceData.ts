
import { useState } from 'react';
import { MaintenanceItem, MaintenanceTask, FixedCost, MaintenanceBudget, MaintenanceTimeline, Vehicle } from '@/types/fleet';
import { toast } from 'sonner';
import { useVehiclesData } from './useVehiclesData';
import { format, addDays, addMonths, differenceInDays, parseISO } from 'date-fns';

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

// Fixed start date: April 16, 2025
const REFERENCE_START_DATE = new Date(2025, 3, 16); // Note: Month is 0-indexed, so 3 = April

export const useMaintenanceData = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const { vehicles } = useVehiclesData();
  
  // Helper function to predict maintenance dates based on reference date
  const predictMaintenanceDate = (vehicle: Vehicle, taskType: string): Date => {
    // Use either the vehicle's start date or our reference date
    const startDate = vehicle.startDate ? parseISO(vehicle.startDate) : REFERENCE_START_DATE;
    const today = new Date();
    const daysInService = differenceInDays(today, startDate);
    
    // Calculate average daily kilometers based on the typical monthly distance
    const AVG_MONTHLY_KM = 7040; // As specified in the data
    const AVG_DAILY_KM = AVG_MONTHLY_KM / 30;
    
    // Assuming odometer at 0 on start date, calculate current expected odometer
    const estimatedCurrentKm = (vehicle.odometer || 0) + (daysInService * AVG_DAILY_KM);
    
    switch(taskType) {
      case 'Tyres':
        // Tyres every 5 months
        return addDays(startDate, 150); // Approx 5 months
        
      case 'Minor Service':
        // Every 15,000 km, approx every 2.1 months
        const minorServiceIntervalDays = Math.floor(15000 / AVG_DAILY_KM);
        const lastMinorServiceKm = Math.floor(estimatedCurrentKm / 15000) * 15000;
        const kmSinceLastMinor = estimatedCurrentKm - lastMinorServiceKm;
        const daysToNextMinor = Math.floor((15000 - kmSinceLastMinor) / AVG_DAILY_KM);
        return addDays(today, daysToNextMinor);
        
      case 'Major Service':
        // Every 45,000 km, approx every 6.4 months
        const majorServiceIntervalDays = Math.floor(45000 / AVG_DAILY_KM);
        const lastMajorServiceKm = Math.floor(estimatedCurrentKm / 45000) * 45000;
        const kmSinceLastMajor = estimatedCurrentKm - lastMajorServiceKm;
        const daysToNextMajor = Math.floor((45000 - kmSinceLastMajor) / AVG_DAILY_KM);
        return addDays(today, daysToNextMajor);
        
      case 'Diesel Refuel':
        // Assuming weekly refueling
        return addDays(today, 7);
        
      default:
        // Default to monthly tasks
        return addMonths(today, 1);
    }
  };
  
  // Calculate days until next maintenance
  const getDaysUntilMaintenance = (date: Date): number => {
    const today = new Date();
    return differenceInDays(date, today);
  };
  
  // Fetch maintenance data with the new structure
  const fetchMaintenanceItems = async () => {
    try {
      // Generate maintenance schedule based on vehicle data and the provided template
      const today = new Date();
      const maintenanceSchedule: MaintenanceItem[] = [];
      
      // Use actual vehicle data to create maintenance schedules
      vehicles.forEach(vehicle => {
        // For each vehicle, generate the next date for each maintenance type
        
        // Add tire replacement
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
        
        // Add minor service
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
        
        // Add major service
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
        
        // Add next refueling
        const nextRefuelDate = predictMaintenanceDate(vehicle, 'Diesel Refuel');
        maintenanceSchedule.push({
          vehicle: `${vehicle.name} (${vehicle.licensePlate})`,
          vehicleId: vehicle.id,
          type: 'Diesel Refuel',
          category: 'Monthly',
          date: format(nextRefuelDate, 'yyyy-MM-dd'),
          status: 'Scheduled',
          cost: 15488 / 4, // Assuming weekly refueling (monthly cost / 4)
          notes: `Due in ${getDaysUntilMaintenance(nextRefuelDate)} days`
        });
      });
      
      // Sort by date (soonest first)
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
