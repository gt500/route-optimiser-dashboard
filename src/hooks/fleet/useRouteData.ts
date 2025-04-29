
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Define the RouteData type
export interface RouteData {
  id: string;
  name: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  vehicle_id?: string;
  vehicle_name?: string;
  stops?: {
    id: string;
    location_name: string;
    sequence: number;
    distance?: number;
    duration?: number;
    cylinders?: number;
    fuel_cost?: number; // Add this for RouteHistoryTab
  }[];
  total_distance?: number;
  total_duration?: number;
  total_cylinders?: number;
  estimated_cost?: number;
}

// Mock data for routes - ensure each route has unique, realistic values
const mockRoutes: RouteData[] = [
  {
    id: '1',
    name: 'Cape Town Urban Delivery',
    date: '2025-04-28',
    status: 'in_progress',
    vehicle_id: 'TRK-001',
    vehicle_name: 'Mercedes Sprinter',
    stops: [
      { id: 's1', location_name: 'Afrox Epping Depot', sequence: 1, distance: 0, duration: 0 },
      { id: 's2', location_name: 'Pick n Pay TableView', sequence: 2, distance: 18.5, duration: 26, cylinders: 18 },
      { id: 's3', location_name: 'SUPERSPAR Parklands', sequence: 3, distance: 4.2, duration: 12, cylinders: 12 },
      { id: 's4', location_name: 'West Coast Village', sequence: 4, distance: 3.8, duration: 10, cylinders: 16 },
    ],
    total_distance: 26.5,
    total_duration: 48,
    total_cylinders: 46,
    estimated_cost: 295.80
  },
  {
    id: '2',
    name: 'Northern Suburbs Route',
    date: '2025-04-29',
    status: 'scheduled',
    vehicle_id: 'TRK-002',
    vehicle_name: 'Leyland Ashok Phoenix',
    stops: [
      { id: 's5', location_name: 'Shell Hugo Street', sequence: 1, distance: 0, duration: 0 },
      { id: 's6', location_name: 'SUPERSPAR Plattekloof', sequence: 2, distance: 12.7, duration: 19, cylinders: 14 },
      { id: 's7', location_name: 'Willowridge Shopping Centre', sequence: 3, distance: 7.8, duration: 15, cylinders: 17 },
      { id: 's8', location_name: 'Zevenwacht', sequence: 4, distance: 9.3, duration: 17, cylinders: 21 },
    ],
    total_distance: 29.8,
    total_duration: 51,
    total_cylinders: 52,
    estimated_cost: 332.95
  },
  {
    id: '3',
    name: 'Winelands Delivery',
    date: '2025-04-30',
    status: 'scheduled',
    vehicle_id: 'TRK-001',
    vehicle_name: 'Mercedes Sprinter',
    stops: [
      { id: 's9', location_name: 'Shell Stellenbosch Square', sequence: 1, distance: 0, duration: 0 },
      { id: 's10', location_name: 'KWIKSPAR Paarl', sequence: 2, distance: 25.6, duration: 34, cylinders: 10 },
      { id: 's11', location_name: 'Laborie', sequence: 3, distance: 8.4, duration: 16, cylinders: 13 },
      { id: 's12', location_name: 'Simonsrust Shopping Centre', sequence: 4, distance: 22.1, duration: 28, cylinders: 19 },
    ],
    total_distance: 56.1,
    total_duration: 78,
    total_cylinders: 42,
    estimated_cost: 625.35
  }
];

export const useRouteData = () => {
  const [routes, setRoutes] = useState<RouteData[]>(mockRoutes);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});

  const fetchRoutes = useCallback(async () => {
    // In a real app, this would fetch from an API
    return routes;
  }, [routes]);
  
  // Add the missing methods to fix our build errors
  const fetchRouteData = useCallback(async () => {
    return await fetchRoutes();
  }, [fetchRoutes]);
  
  const fetchActiveRoutes = useCallback(async () => {
    const data = await fetchRoutes();
    return data.filter(route => route.status === 'scheduled' || route.status === 'in_progress');
  }, [fetchRoutes]);
  
  const fetchRouteHistory = useCallback(async () => {
    const data = await fetchRoutes();
    return data.filter(route => route.status === 'completed' || route.status === 'cancelled');
  }, [fetchRoutes]);
  
  // Update this method to return an array instead of a single object
  const fetchRouteDataByName = useCallback(async (routeName: string) => {
    const data = await fetchRoutes();
    const matchingRoutes = data.filter(route => route.name === routeName);
    return matchingRoutes; // Return array instead of single object
  }, [fetchRoutes]);
  
  const getWeeklyDeliveryData = useCallback(async () => {
    const data = await fetchRoutes();
    // Group by day of week for weekly chart
    const weeklyData = [
      { day: 'Mon', completed: 0, scheduled: 0 },
      { day: 'Tue', completed: 0, scheduled: 0 },
      { day: 'Wed', completed: 0, scheduled: 0 },
      { day: 'Thu', completed: 0, scheduled: 0 },
      { day: 'Fri', completed: 0, scheduled: 0 },
      { day: 'Sat', completed: 0, scheduled: 0 },
      { day: 'Sun', completed: 0, scheduled: 0 },
    ];
    
    // Simple simulation for chart data
    data.forEach((route, index) => {
      const dayIndex = index % 7;
      if (route.status === 'completed') {
        weeklyData[dayIndex].completed += 1;
      } else {
        weeklyData[dayIndex].scheduled += 1;
      }
    });
    
    return weeklyData;
  }, [fetchRoutes]);
  
  const getOptimizationStats = useCallback(async () => {
    // Return mock optimization stats for the dashboard
    return {
      totalRoutes: routes.length,
      optimizedRoutes: Math.floor(routes.length * 0.7),
      distanceSaved: 128.5,
      timeSaved: 214,
      fuelSaved: 18.6
    };
  }, [routes.length]);

  const startRoute = useCallback(async (routeId: string) => {
    // Mark route as processing
    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
    
    try {
      console.log(`Starting route with ID: ${routeId} in useRouteData hook`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update route status in our state
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'in_progress' } : route
        )
      );
      
      console.log("Route status updated to in_progress");
      return true;
    } catch (error) {
      console.error('Error in startRoute:', error);
      throw error;
    } finally {
      // Clear processing state
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  }, []);

  const completeRoute = useCallback(async (routeId: string) => {
    // Mark route as processing
    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'completing' }));
    
    try {
      console.log(`Completing route with ID: ${routeId} in useRouteData hook`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update route status in our state
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'completed' } : route
        )
      );
      
      console.log("Route status updated to completed");
      return true;
    } catch (error) {
      console.error('Error in completeRoute:', error);
      throw error;
    } finally {
      // Clear processing state
      setProcessingRoutes(prev => {
        const updated = { ...prev };
        delete updated[routeId];
        return updated;
      });
    }
  }, []);

  return {
    routes,
    processingRoutes,
    fetchRoutes,
    startRoute,
    completeRoute,
    // Include the methods needed by other components
    fetchRouteData,
    fetchActiveRoutes,
    fetchRouteHistory,
    fetchRouteDataByName,
    getWeeklyDeliveryData,
    getOptimizationStats
  };
};
