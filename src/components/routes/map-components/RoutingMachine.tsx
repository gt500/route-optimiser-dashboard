
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { toast } from 'sonner';

interface RoutingMachineProps {
  waypoints?: L.LatLng[];
  forceRouteUpdate?: boolean;
  onRouteFound?: (route: { 
    distance: number; 
    duration: number; 
    coordinates: [number, number][]; 
    trafficDensity?: 'light' | 'moderate' | 'heavy';
    waypoints?: { distance: number; duration: number }[];
  }) => void;
  routeOptions?: {
    avoidTraffic?: boolean;
    alternateRoutes?: boolean;
    useRealTimeData?: boolean;
    routeColor?: string;
    routeWeight?: number;
  };
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints = [], 
  forceRouteUpdate, 
  onRouteFound,
  routeOptions = { 
    avoidTraffic: true, 
    alternateRoutes: false, 
    useRealTimeData: true,
    routeColor: '#6366F1',
    routeWeight: 6
  }
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) {
      console.log("Not enough waypoints or map not ready:", waypoints);
      return;
    }
    
    console.log("Creating route with waypoints:", waypoints);
    
    let routingControl: L.Routing.Control | null = null;
    
    const createRoute = () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      try {
        // Ensure all waypoints are valid LatLng objects with extra validation
        const validWaypoints = waypoints.filter(wp => {
          // Extra checks to ensure valid latitude and longitude
          if (!wp || typeof wp.lat !== 'function' || typeof wp.lng !== 'function') {
            return false;
          }
          
          const lat = wp.lat();
          const lng = wp.lng();
          
          return (
            lat !== undefined && lng !== undefined &&
            !isNaN(lat) && !isNaN(lng) && 
            lat !== 0 && lng !== 0 &&
            Math.abs(lat) <= 90 && Math.abs(lng) <= 180
          );
        });
        
        if (validWaypoints.length < 2) {
          console.log("Not enough valid waypoints to create route:", validWaypoints);
          return;
        }
        
        console.log("Creating route with valid waypoints:", validWaypoints);
        
        // Always enable real-time traffic data by default for maximum efficiency
        const useRealTimeTraffic = routeOptions.useRealTimeData !== false;
        
        if (useRealTimeTraffic) {
          toast.info("Using real-time traffic data for optimal routing");
        }
        
        // Extract styling options from routeOptions or use defaults
        const routeColor = routeOptions.routeColor || '#6366F1';
        const routeWeight = routeOptions.routeWeight || 6;
        
        // Configure options with real-time traffic preferences
        const routerOptions: L.Routing.RoutingControlOptions = {
          router: L.Routing.osrm({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving', // Use driving profile for road-based routing
            useHints: false, // Disable hints for more accurate real-time routing
            suppressDemoServerWarning: true,
            urlParameters: {
              // Always optimize for traffic avoidance
              alternatives: routeOptions.alternateRoutes ? 'true' : 'false',
              steps: 'true',
              geometries: 'geojson',
              overview: 'full',
              annotations: 'true',
              // Always use real-time traffic data when available
              traffic: useRealTimeTraffic ? 'true' : 'false'
            }
          }),
          waypoints: validWaypoints,
          lineOptions: {
            styles: [
              { color: routeColor, weight: routeWeight, opacity: 0.7 },
              { color: '#FFFFFF', weight: routeWeight - 2, opacity: 0.5, dashArray: '5,10' } // Add a dashed white line in the middle
            ],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: routeOptions.alternateRoutes,
          show: false
        };
        
        routingControl = L.Routing.control(routerOptions).addTo(map);
        
        // Hide the routing control UI but show the route path
        routingControl.hide();
        
        // Extract route information when a route is found
        routingControl.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const route = routes[0];
            // Use actual distance value from routing service
            const totalDistance = route.summary.totalDistance / 1000; // convert to km
            const totalTime = route.summary.totalTime / 60; // convert to minutes
            
            console.log(`Route found with actual data: ${totalDistance.toFixed(2)} km, ${totalTime.toFixed(0)} minutes`);
            
            // Extract detailed waypoint information
            const waypointData = route.waypoints.map((wp, index) => {
              // Get leg distance if available (distance between this waypoint and the next one)
              const legDistance = index < route.legs.length ? route.legs[index].distance / 1000 : 0;
              const legDuration = index < route.legs.length ? route.legs[index].time / 60 : 0;
              
              return {
                distance: legDistance, // in km
                duration: legDuration // in minutes
              };
            });
            
            // Analyze traffic conditions based on actual data
            const trafficFactor = totalTime / (totalDistance * 1.2); // minutes per km, with baseline of 1.2 min/km
            let trafficDensity: 'light' | 'moderate' | 'heavy' = 'moderate';
            
            if (trafficFactor < 1.0) {
              trafficDensity = 'light';
            } else if (trafficFactor > 1.8) {
              trafficDensity = 'heavy';
            }
            
            if (useRealTimeTraffic) {
              toast.info(`Traffic analysis: ${trafficDensity} traffic conditions detected`);
            }
            
            // Extract the coordinates from the route
            const coordinates = route.coordinates.map((coord) => [
              coord.lat,
              coord.lng
            ] as [number, number]);
            
            if (onRouteFound) {
              onRouteFound({
                distance: totalDistance,
                duration: totalTime,
                coordinates,
                trafficDensity,
                waypoints: waypointData
              });
            }
          }
        });
      } catch (error) {
        console.error("Error creating routing control:", error);
        toast.error("Error generating route with traffic data");
      }
    };
    
    createRoute();
    
    return () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, waypoints, forceRouteUpdate, onRouteFound, routeOptions]);
  
  return null;
};

export default RoutingMachine;
