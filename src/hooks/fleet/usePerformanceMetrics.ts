import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, FleetPerformanceMetrics } from '@/types/fleet';
import { differenceInDays, parseISO } from 'date-fns';

// Default initial metrics
const defaultMetrics: FleetPerformanceMetrics = {
  fuelEfficiency: { value: 0, target: 10, unit: 'km/L' },
  fleetUtilization: { value: 0, target: 80, unit: '%' },
  maintenanceCompliance: { value: 0, target: 95, unit: '%' },
  onTimeDeliveries: { value: 0, target: 90, unit: '%' }
};

export const usePerformanceMetrics = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<FleetPerformanceMetrics>(defaultMetrics);

  // Calculate fleet performance metrics using real data
  const calculateFleetPerformance = async (vehicleData: Vehicle[], routeData: any[]) => {
    // Calculate fuel efficiency based on routes
    let totalDistance = 0;
    let totalFuelConsumption = 0;
    let onTimeCount = 0;
    let totalDeliveries = 0;

    // Process route data for metrics
    if (routeData.length > 0) {
      // Sum up total distance
      totalDistance = routeData.reduce((sum, route) => sum + (route.total_distance || 0), 0);
      
      // Get base fuel consumption from cost_factors if available
      const { data: fuelData, error } = await supabase
        .from('cost_factors')
        .select('value')
        .eq('name', 'base_fuel_consumption')
        .single();
        
      // Calculate fuel consumption
      const baseConsumption = (!error && fuelData) ? fuelData.value : 12; // L/100km
      totalFuelConsumption = (totalDistance * baseConsumption) / 100;
      
      // Calculate on-time delivery percentage
      totalDeliveries = routeData.length;
      onTimeCount = routeData.filter(route => 
        route.status === 'completed' || 
        route.status === 'delivered' || 
        route.status === 'on_time').length;
    }
    
    // Calculate fleet utilization
    // Only include vehicles that have been in service for at least 7 days
    const activeVehicles = vehicleData.filter(v => {
      // Consider vehicle active if it's on route
      if (v.status === 'On Route') return true;
      
      // Check if vehicle has a start date and has been in service for at least 7 days
      if (v.startDate) {
        const daysInService = differenceInDays(new Date(), parseISO(v.startDate));
        // Only count vehicles that have been in service for at least 7 days
        return daysInService >= 7;
      }
      
      // If no start date, default to including it (backwards compatibility)
      return true;
    }).length;
    
    const servicedVehicles = vehicleData.filter(v => v.startDate).length;
    const utilizationRate = (servicedVehicles > 0) 
      ? (activeVehicles / servicedVehicles) * 100 
      : 0;

    // Calculate maintenance compliance
    // Consider maintenance history in relation to vehicle start date
    const vehiclesNeedingMaintenance = vehicleData.filter(v => {
      if (!v.startDate || !v.lastService) return false;
      
      const daysSinceStart = differenceInDays(new Date(), parseISO(v.startDate));
      const daysSinceService = differenceInDays(new Date(), parseISO(v.lastService));
      
      // Vehicle needs maintenance if it's been more than 90 days since last service
      // and has been in service for at least 90 days
      return daysSinceService > 90 && daysSinceStart > 90;
    }).length;
    
    const vehiclesInMaintenance = vehicleData.filter(v => v.status === 'Maintenance').length;
    const maintenanceCompliance = servicedVehicles > 0 
      ? 100 - ((vehiclesNeedingMaintenance - vehiclesInMaintenance) / servicedVehicles * 100)
      : 95; // Default if no vehicles with start date
    
    // Set fuel efficiency (km/L)
    const fuelEfficiency = totalDistance > 0 && totalFuelConsumption > 0
      ? totalDistance / totalFuelConsumption
      : 8.3; // Default if no data
      
    // Calculate on-time delivery percentage
    const onTimePercentage = totalDeliveries > 0 
      ? (onTimeCount / totalDeliveries) * 100 
      : 88; // Default if no data

    const newMetrics = {
      fuelEfficiency: { 
        value: Number(fuelEfficiency.toFixed(1)), 
        target: 10, 
        unit: 'km/L' 
      },
      fleetUtilization: { 
        value: Math.round(utilizationRate), 
        target: 80, 
        unit: '%' 
      },
      maintenanceCompliance: { 
        value: Math.max(0, Math.min(100, Math.round(maintenanceCompliance))), // Ensure between 0-100%
        target: 95, 
        unit: '%' 
      },
      onTimeDeliveries: { 
        value: Math.round(onTimePercentage), 
        target: 90, 
        unit: '%' 
      }
    };

    setPerformanceMetrics(newMetrics);
    return newMetrics;
  };

  return {
    performanceMetrics,
    calculateFleetPerformance,
  };
};
