
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
        createMarker: function() { return null; } // Disable default markers
      }).addTo(map);

      // Set initialization flag to prevent repeated zooming
      isInitializedRef.current = true;
      routingControlRef.current = routingControl;
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
