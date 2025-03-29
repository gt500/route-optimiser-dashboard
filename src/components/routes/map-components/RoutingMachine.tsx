
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
  waypoints: Array<[number, number]>;
}

export const RoutingMachine: React.FC<RoutingMachineProps> = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#6366F1', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: function() { return null; } // Disable default markers
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [waypoints, map]);

  return null;
};
