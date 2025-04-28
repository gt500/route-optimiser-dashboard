
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
  }[];
  total_distance?: number;
  total_duration?: number;
  total_cylinders?: number;
}

// Mock data for routes
const mockRoutes: RouteData[] = [
  {
    id: '1',
    name: 'Cape Town Urban Delivery',
    date: '2025-04-28',
    status: 'in_progress',
    vehicle_id: 'v1',
    vehicle_name: 'Mercedes Sprinter',
    stops: [
      { id: 's1', location_name: 'Afrox Epping Depot', sequence: 1, distance: 0, duration: 0 },
      { id: 's2', location_name: 'Pick n Pay TableView', sequence: 2, distance: 18.5, duration: 26 },
      { id: 's3', location_name: 'SUPERSPAR Parklands', sequence: 3, distance: 4.2, duration: 12 },
      { id: 's4', location_name: 'West Coast Village', sequence: 4, distance: 3.8, duration: 10 },
    ],
    total_distance: 26.5,
    total_duration: 48,
    total_cylinders: 46
  },
  {
    id: '2',
    name: 'Northern Suburbs Route',
    date: '2025-04-29',
    status: 'scheduled',
    vehicle_id: 'v2',
    vehicle_name: 'Isuzu NPR',
    stops: [
      { id: 's5', location_name: 'Shell Hugo Street', sequence: 1, distance: 0, duration: 0 },
      { id: 's6', location_name: 'SUPERSPAR Plattekloof', sequence: 2, distance: 12.7, duration: 19 },
      { id: 's7', location_name: 'Willowridge Shopping Centre', sequence: 3, distance: 7.8, duration: 15 },
      { id: 's8', location_name: 'Zevenwacht', sequence: 4, distance: 9.3, duration: 17 },
    ],
    total_distance: 29.8,
    total_duration: 51,
    total_cylinders: 52
  },
  {
    id: '3',
    name: 'Winelands Delivery',
    date: '2025-04-30',
    status: 'scheduled',
    vehicle_id: 'v3',
    vehicle_name: 'Ford Transit',
    stops: [
      { id: 's9', location_name: 'Shell Stellenbosch Square', sequence: 1, distance: 0, duration: 0 },
      { id: 's10', location_name: 'KWIKSPAR Paarl', sequence: 2, distance: 25.6, duration: 34 },
      { id: 's11', location_name: 'Laborie', sequence: 3, distance: 8.4, duration: 16 },
      { id: 's12', location_name: 'Simonsrust Shopping Centre', sequence: 4, distance: 22.1, duration: 28 },
    ],
    total_distance: 56.1,
    total_duration: 78,
    total_cylinders: 42
  }
];

export const useRouteData = () => {
  const [routes, setRoutes] = useState<RouteData[]>(mockRoutes);
  const [processingRoutes, setProcessingRoutes] = useState<Record<string, string>>({});

  const fetchRoutes = useCallback(async () => {
    // In a real app, this would fetch from an API
    return mockRoutes;
  }, []);

  const startRoute = useCallback(async (routeId: string) => {
    // Mark route as processing
    setProcessingRoutes(prev => ({ ...prev, [routeId]: 'starting' }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update route status
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'in_progress' } : route
        )
      );
      
      toast.success('Route started successfully');
    } catch (error) {
      toast.error('Failed to start route');
      console.error(error);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update route status
      setRoutes(prev => 
        prev.map(route => 
          route.id === routeId ? { ...route, status: 'completed' } : route
        )
      );
      
      toast.success('Route completed successfully');
    } catch (error) {
      toast.error('Failed to complete route');
      console.error(error);
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
    completeRoute
  };
};
