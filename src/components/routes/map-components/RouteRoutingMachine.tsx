
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { toast } from 'sonner';
import { getCurrentTrafficCondition } from '@/utils/route/trafficUtils';

interface RouteRoutingMachineProps {
  waypoints: L.LatLng[];
  forceRouteUpdate?: number;
  onRouteFound?: (
    distance: number, 
    duration: number,
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => void;
  showRoadRoutes?: boolean;
  routeName?: string;
}

const RouteRoutingMachine: React.FC<RouteRoutingMachineProps> = ({ 
  waypoints = [], 
  forceRouteUpdate, 
  onRouteFound,
  showRoadRoutes = true,
  routeName
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) {
      console.log("Not enough waypoints or map not ready:", waypoints);
      return;
    }
    
    console.log("Creating route with waypoints:", waypoints, "route name:", routeName);
    
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
        
        // Check for predefined route data first
        let knownRoute = routeName ? identifyKnownRoute(routeName) : null;
        
        if (knownRoute) {
          console.log("Found predefined data for route:", knownRoute.name);
          
          // Display the predefined route on the map
          routingControl = L.Routing.control({
            waypoints: validWaypoints,
            lineOptions: {
              styles: [
                { color: '#6366F1', weight: 6, opacity: 0.7 },
                { color: '#FFFFFF', weight: 4, opacity: 0.5, dashArray: '5,10' }
              ]
            },
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            show: false
          }).addTo(map);
          
          // Hide the control UI but show the route line
          routingControl.hide();
          
          // Return the predefined route data
          if (onRouteFound) {
            const coordinates = validWaypoints.map(wp => [wp.lat(), wp.lng()] as [number, number]);
            
            setTimeout(() => {
              onRouteFound(
                knownRoute!.distance,
                knownRoute!.duration,
                coordinates,
                knownRoute!.segments,
                getCurrentTrafficCondition()
              );
            }, 300);
          }
          
          return;
        }
        
        // If not a predefined route, use the routing API
        const routerOptions: L.Routing.RoutingControlOptions = {
          router: L.Routing.osrm({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving',
            useHints: false,
            suppressDemoServerWarning: true,
            urlParameters: {
              alternatives: 'false',
              steps: 'true',
              geometries: 'geojson',
              overview: 'full',
              annotations: 'true',
              traffic: 'true'
            }
          }),
          waypoints: validWaypoints,
          lineOptions: {
            styles: [
              { color: '#6366F1', weight: 6, opacity: 0.7 },
              { color: '#FFFFFF', weight: 4, opacity: 0.5, dashArray: '5,10' }
            ],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          show: false
        };
        
        routingControl = L.Routing.control(routerOptions).addTo(map);
        
        // Hide the routing control UI but show the route path
        routingControl.hide();
        
        // Define handleRoute function inside the useEffect
        const handleRoute = (e: L.Routing.RoutingResultEvent) => {
          const routes = e.routes;
          if (routes && routes.length > 0 && onRouteFound) {
            const selectedRoute = routes[0];
            
            // Extract coordinates from the route
            const coordinates: [number, number][] = selectedRoute.coordinates.map(coord => 
              [coord.lat, coord.lng]
            );
            
            // Extract waypoint data if available
            const waypoints = selectedRoute.waypoints?.map(wp => ({
              distance: wp.distance || 0,
              duration: wp.duration || 0
            }));
            
            // Determine traffic conditions based on average speed
            let trafficConditions: 'light' | 'moderate' | 'heavy' | undefined = undefined;
            
            if (selectedRoute.summary.totalDistance && selectedRoute.summary.totalTime) {
              const avgSpeedKmh = (selectedRoute.summary.totalDistance / 1000) / (selectedRoute.summary.totalTime / 3600);
              
              if (avgSpeedKmh > 60) trafficConditions = 'light';
              else if (avgSpeedKmh > 35) trafficConditions = 'moderate';
              else trafficConditions = 'heavy';
              
              console.log(`Average route speed: ${avgSpeedKmh.toFixed(1)} km/h (${trafficConditions} traffic)`);
            }
            
            // Format route data for displaying to user
            console.log(`Route found: ${(selectedRoute.summary.totalDistance / 1000).toFixed(1)}km, ${Math.round(selectedRoute.summary.totalTime / 60)}min`);
            
            onRouteFound(
              selectedRoute.summary.totalDistance / 1000,
              selectedRoute.summary.totalTime / 60,
              coordinates,
              waypoints,
              trafficConditions
            );
          }
        };
        
        // Extract route information when a route is found
        routingControl.on('routesfound', handleRoute);
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
  }, [map, waypoints, forceRouteUpdate, onRouteFound, routeName]);
  
  return null;
};

// Helper function to identify known routes by name
function identifyKnownRoute(routeName: string): {
  name: string;
  distance: number;
  duration: number;
  segments: { distance: number; duration: number }[];
} | null {
  // Known routes with predefined data
  const knownRoutes = [
    {
      name: "Cape Town Urban Delivery",
      distance: 26.5,
      duration: 48,
      segments: [
        { distance: 0, duration: 0 },
        { distance: 18.5, duration: 26 },
        { distance: 4.2, duration: 12 },
        { distance: 3.8, duration: 10 }
      ]
    },
    {
      name: "Northern Suburbs Route",
      distance: 29.8,
      duration: 51,
      segments: [
        { distance: 0, duration: 0 },
        { distance: 12.7, duration: 19 },
        { distance: 7.8, duration: 15 },
        { distance: 9.3, duration: 17 }
      ]
    },
    {
      name: "Winelands Delivery",
      distance: 56.1,
      duration: 78,
      segments: [
        { distance: 0, duration: 0 },
        { distance: 25.6, duration: 34 },
        { distance: 8.4, duration: 16 },
        { distance: 22.1, duration: 28 }
      ]
    }
  ];
  
  // Check if route name matches any of our known routes
  const matchedRoute = knownRoutes.find(route => 
    route.name.toLowerCase() === routeName.toLowerCase()
  );
  
  return matchedRoute || null;
}

export default RouteRoutingMachine;
