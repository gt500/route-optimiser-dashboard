import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

export interface RouteStop {
  id: string;
  location_id: string;
  location_name?: string;
  cylinders: number;
  sequence: number;
  distance?: number;
  fuel_cost?: number;
}

export interface RouteData {
  id: string;
  name: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  total_distance?: number;
  total_cylinders: number;
  total_duration?: number;
  estimated_cost?: number;
  vehicle_id?: string;
  vehicle_name?: string;
  stops?: RouteStop[];
  route_type?: string;
  // Note: region and country might not exist in the actual table
  // but we'll keep them in the interface for future compatibility
}

export const useRouteData = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Get historical routes (completed or cancelled)
  const fetchRouteHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id
        `)
        .or('status.eq.completed,status.eq.cancelled')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching route history:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      
      if (routesWithVehicleIds.length > 0) {
        const vehicleIds = routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[];
        const vehicles = await getVehicleData(vehicleIds);
        
        // Add vehicle_name to routes
        const routesWithVehicleInfo = data.map(route => {
          if (route.vehicle_id) {
            const vehicle = vehicles.find(v => v.id === route.vehicle_id);
            return {
              ...route,
              vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : route.vehicle_id
            };
          }
          return route;
        });
        
        return routesWithVehicleInfo as RouteData[];
      }
      
      return data as RouteData[];
    } catch (error) {
      console.error('Error in fetchRouteHistory:', error);
      toast.error('Failed to load route history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get active routes (scheduled or in_progress)
  const fetchActiveRoutes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id
        `)
        .or('status.eq.scheduled,status.eq.in_progress')
        .order('date', { ascending: true });
        
      if (error) {
        console.error('Error fetching active routes:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get all deliveries for these routes
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select(`
          id, route_id, location_id, cylinders, sequence
        `)
        .in('route_id', data.map(route => route.id));
        
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
      }
      
      // Get all location IDs from deliveries
      const locationIds = deliveriesData ? 
        [...new Set(deliveriesData.map(d => d.location_id))] : [];
      
      // Get location data for all locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select(`id, name`)
        .in('id', locationIds);
        
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      
      let vehicles = [];
      if (routesWithVehicleIds.length > 0) {
        const vehicleIds = routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[];
        vehicles = await getVehicleData(vehicleIds);
      }
      
      // Map locations to deliveries
      const deliveriesWithLocationNames = deliveriesData?.map(delivery => {
        const location = locationsData?.find(loc => loc.id === delivery.location_id);
        return {
          ...delivery,
          location_name: location ? location.name : 'Unknown Location'
        };
      });
      
      // Group deliveries by route
      const deliveriesByRoute: Record<string, RouteStop[]> = {};
      
      deliveriesWithLocationNames?.forEach(delivery => {
        if (!deliveriesByRoute[delivery.route_id]) {
          deliveriesByRoute[delivery.route_id] = [];
        }
        deliveriesByRoute[delivery.route_id].push(delivery as RouteStop);
      });
      
      // Add stops and vehicle_name to routes
      const routesWithStops = data.map(route => {
        // Find vehicle info if available
        const vehicle = route.vehicle_id ? 
          vehicles.find(v => v.id === route.vehicle_id) : null;
        
        return {
          ...route,
          stops: deliveriesByRoute[route.id] || [],
          vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : null
        };
      });
      
      return routesWithStops as RouteData[];
    } catch (error) {
      console.error('Error in fetchActiveRoutes:', error);
      toast.error('Failed to load active routes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get all route data (regardless of status)
  const fetchRouteData = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id
        `)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching route data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      
      if (routesWithVehicleIds.length > 0) {
        const vehicleIds = routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[];
        const vehicles = await getVehicleData(vehicleIds);
        
        // Add vehicle_name to routes
        const routesWithVehicleInfo = data.map(route => {
          if (route.vehicle_id) {
            const vehicle = vehicles.find(v => v.id === route.vehicle_id);
            return {
              ...route,
              vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : route.vehicle_id
            };
          }
          return route;
        });
        
        return routesWithVehicleInfo as RouteData[];
      }
      
      return data as RouteData[];
    } catch (error) {
      console.error('Error in fetchRouteData:', error);
      toast.error('Failed to load route data');
      return [];
    }
  };

  // New function to fetch route data by name
  const fetchRouteDataByName = async (routeName: string) => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id
        `)
        .ilike('name', `%${routeName}%`)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching route data by name:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      
      if (routesWithVehicleIds.length > 0) {
        const vehicleIds = routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[];
        const vehicles = await getVehicleData(vehicleIds);
        
        // Add vehicle_name to routes
        const routesWithVehicleInfo = data.map(route => {
          if (route.vehicle_id) {
            const vehicle = vehicles.find(v => v.id === route.vehicle_id);
            const routeWithVehicle = {
              ...route,
              vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : route.vehicle_id,
              route_type: routeName // Add route_type for filtering
            };
            return routeWithVehicle;
          }
          return {
            ...route,
            route_type: routeName
          };
        });
        
        return routesWithVehicleInfo as RouteData[];
      }
      
      // Add route_type to all routes
      return data.map(route => ({
        ...route,
        route_type: routeName
      })) as RouteData[];
    } catch (error) {
      console.error('Error in fetchRouteDataByName:', error);
      toast.error('Failed to load route data by name');
      return [];
    }
  };

  // Helper functions for Dashboard analytics
  const getOptimizationStats = async () => {
    try {
      const routes = await fetchRouteHistory();
      
      // Default stats if no data available
      const defaultStats = {
        routesOptimized: 0,
        fuelSaved: 0,
        timeSaved: 0,
        costSaved: 0
      };
      
      if (!routes || routes.length === 0) {
        return defaultStats;
      }
      
      // Calculate optimization stats (mock data for now)
      return {
        routesOptimized: routes.length,
        fuelSaved: Math.round(routes.reduce((sum, route) => sum + (route.total_distance || 0), 0) * 0.15),
        timeSaved: Math.round(routes.reduce((sum, route) => sum + (route.total_duration || 0), 0) * 0.2 / 60),
        costSaved: Math.round(routes.reduce((sum, route) => sum + (route.estimated_cost || 0), 0) * 0.18)
      };
    } catch (error) {
      console.error('Error getting optimization stats:', error);
      return {
        routesOptimized: 0,
        fuelSaved: 0,
        timeSaved: 0,
        costSaved: 0
      };
    }
  };

  const getWeeklyDeliveryData = async () => {
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data, error } = await supabase
        .from('routes')
        .select(`date, total_cylinders, status`)
        .gte('date', lastWeek.toISOString())
        .order('date', { ascending: true });
        
      if (error) {
        console.error('Error fetching weekly delivery data:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        // Return mock data
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 6 + i);
          return {
            name: format(date, 'EEE'),
            completed: Math.floor(Math.random() * 30) + 10,
            scheduled: Math.floor(Math.random() * 15)
          };
        });
      }
      
      // Process real data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const processedData = days.map(day => {
        const relevantData = data.filter(route => 
          format(new Date(route.date), 'EEE') === day
        );
        
        const completed = relevantData
          .filter(route => route.status === 'completed')
          .reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
          
        const scheduled = relevantData
          .filter(route => route.status === 'scheduled' || route.status === 'in_progress')
          .reduce((sum, route) => sum + (route.total_cylinders || 0), 0);
          
        return {
          name: day,
          completed,
          scheduled
        };
      });
      
      return processedData;
    } catch (error) {
      console.error('Error getting weekly delivery data:', error);
      // Return mock data on error
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return {
          name: format(date, 'EEE'),
          completed: Math.floor(Math.random() * 30) + 10,
          scheduled: Math.floor(Math.random() * 15)
        };
      });
    }
  };

  // Helper function to get vehicle data
  const getVehicleData = async (vehicleIds: string[]) => {
    if (vehicleIds.length === 0) return [];
    
    try {
      // This is a mock function since we don't have direct database access to vehicles
      // In a real implementation, you would query the database for vehicle data
      
      const { data: mockVehicles } = await supabase
        .from('routes')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds)
        .limit(1);
      
      // Return mock vehicle data for the IDs
      return vehicleIds.map(id => ({
        id,
        name: id === 'TRK-001' ? 'Leyland Phoenix' : 'Leyland Phoenix',
        licensePlate: id === 'TRK-001' ? 'CA 123-456' : 'CA 789-012'
      }));
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      return [];
    }
  };

  return {
    isLoading,
    fetchRouteHistory,
    fetchActiveRoutes,
    fetchRouteData,
    fetchRouteDataByName,
    getOptimizationStats,
    getWeeklyDeliveryData
  };
};

export default useRouteData;
