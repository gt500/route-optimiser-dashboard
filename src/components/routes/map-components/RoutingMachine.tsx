
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
  waypoints: Array<[number, number]>;
  color?: string;
  fitBounds?: boolean;
}

export const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints, 
  color = '#6366F1',
  fitBounds = true
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  
  // Prevent constant zooming by using a ref to track initialization
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    // Remove previous routing control if it exists
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (err) {
        console.error("Error removing routing control:", err);
      }
      routingControlRef.current = null;
    }

    try {
      // Override the _zoomToRoute function to prevent automatic zooming
      const originalZoomToRoute = L.Routing.Plan.prototype._zoomToRoute;
      L.Routing.Plan.prototype._zoomToRoute = function(...args: any[]) {
        if (!isInitializedRef.current) {
          originalZoomToRoute.apply(this, args);
          isInitializedRef.current = true;
        }
      };

      const routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false, // Prevent adding new waypoints by clicking
        fitSelectedRoutes: fitBounds && !isInitializedRef.current, // Only fit bounds once
        lineOptions: {
          styles: [{ color: color, weight: 4, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: function() { return null; }, // Disable default markers
        useZoomParameter: false, // Disable automatic zoom changes
        autoRoute: true, // Calculate routes automatically
        useHints: false, // Don't use routing hints (can cause issues)
        show: false // Don't show the routing control panel
      }).addTo(map);

      // Disable the fitSelectedRoutes feature after initial setup
      routingControl.options.fitSelectedRoutes = false;

      routingControlRef.current = routingControl;
      
      // Preserve user's zoom level after routing is added
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();
      
      // Listen for the routesfound event
      routingControl.on('routesfound', () => {
        // Short timeout to let the routes render before resetting the view if needed
        setTimeout(() => {
          if (!isInitializedRef.current) {
            isInitializedRef.current = true;
          } else {
            // Restore the user's view if already initialized
            map.setView(currentCenter, currentZoom);
          }
        }, 100);
      });
    } catch (err) {
      console.error("Error creating routing control:", err);
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
          
          // Clean up any remaining routing elements
          document.querySelectorAll('.leaflet-routing-container').forEach(el => {
            el.remove();
          });
        } catch (err) {
          console.error("Error cleaning up routing control:", err);
        }
        routingControlRef.current = null;
      }
    };
  }, [waypoints, map, color, fitBounds]);

  return null;
};
