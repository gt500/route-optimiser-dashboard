
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
  waypoints: { lat: number; lng: number }[];
  forceRouteUpdate?: boolean;
  onRouteFound?: (route: { 
    distance: number; 
    duration: number; 
    coordinates: [number, number][];
  }) => void;
}

// @ts-ignore - L.Routing is not in the types
const L = window.L;

const RoutingMachine = ({ waypoints, forceRouteUpdate, onRouteFound }: RoutingMachineProps) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    
    let routingControl: any = null;
    
    const createRoute = () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      routingControl = L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
          styles: [{ color: '#6366F1', weight: 4, opacity: 0.7 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false
      }).addTo(map);
      
      routingControl.hide();
      
      // Extract route information when a route is found
      routingControl.on('routesfound', (e: any) => {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          const totalDistance = route.summary.totalDistance / 1000; // convert to km
          const totalTime = route.summary.totalTime / 60; // convert to minutes
          
          // Extract the coordinates from the route
          const coordinates: [number, number][] = route.coordinates.map((coord: any) => [
            coord.lat,
            coord.lng
          ]);
          
          if (onRouteFound) {
            onRouteFound({
              distance: totalDistance,
              duration: totalTime,
              coordinates
            });
          }
        }
      });
    };
    
    createRoute();
    
    return () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
    // Add forceRouteUpdate as a dependency to recreate route when it changes
  }, [map, waypoints, forceRouteUpdate, onRouteFound]);
  
  return null;
};

export default RoutingMachine;
