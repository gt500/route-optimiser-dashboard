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
    // Always use April 16, 2025 as the start date for consistent maintenance scheduling
    const startDate = REFERENCE_START_DATE;
    const today = new Date();
    
    // Calculate days in service relative to the reference date
    // For simulation purposes, we'll use a fixed period based on the reference
    // This allows us to generate future maintenance dates in a consistent way
    const simulatedDaysInService = differenceInDays(
      addDays(startDate, 30), // Simulate being 30 days from start date
      startDate
    );
    
    // Calculate average daily kilometers based on the typical monthly distance
    const AVG_MONTHLY_KM = 7040; // As specified in the data
    const AVG_DAILY_KM = AVG_MONTHLY_KM / 30;
    
    // Calculate estimated odometer based on simulated days in service
    const estimatedCurrentKm = (vehicle.odometer || 0) + (simulatedDaysInService * AVG_DAILY_KM);
    
    switch(taskType) {
      case 'Tyres':
        // Tyres every 5 months (150 days from reference start)
        return addDays(startDate, 150);
        
      case 'Minor Service':
        // Every 15,000 km, approx every 2.1 months (64 days from reference start)
        return addDays(startDate, 64);
        
      case 'Major Service':
        // Every 45,000 km, approx every 6.4 months (192 days from reference start)
        return addDays(startDate, 192);
        
      case 'Diesel Refuel':
        // Weekly refueling (7 days from reference start, then every 7 days)
        return addDays(startDate, 7);
        
      default:
        // Default to monthly tasks (30 days from reference start)
        return addMonths(startDate, 1);
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
      const maintenanceSchedule: MaintenanceItem[] = [];
      
      // Use actual vehicle data to create maintenance schedules
      vehicles.forEach(vehicle => {
        // Set the vehicle start date to April 16, 2025 for maintenance calculations
        const vehicleWithFixedDate = {
          ...vehicle,
          startDate: format(REFERENCE_START_DATE, 'yyyy-MM-dd')
        };
        
        // For each vehicle, generate the next date for each maintenance type
        
        // Add tire replacement
        const nextTyreDate = predictMaintenanceDate(vehicleWithFixedDate, 'Tyres');
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
        const nextMinorServiceDate = predictMaintenanceDate(vehicleWithFixedDate, 'Minor Service');
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
        const nextMajorServiceDate = predictMaintenanceDate(vehicleWithFixedDate, 'Major Service');
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
        const nextRefuelDate = predictMaintenanceDate(vehicleWithFixedDate, 'Diesel Refuel');
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
