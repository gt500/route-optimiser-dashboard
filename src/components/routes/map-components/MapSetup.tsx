
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapSetupProps {
  bounds: L.LatLngBounds | null;
  onMapReady?: () => void;
}

const MapSetup: React.FC<MapSetupProps> = ({ bounds, onMapReady }) => {
  const map = useMap();
  const mapRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (map) {
      mapRef.current = map;
      
      // Call onMapReady callback if provided
      if (onMapReady) {
        onMapReady();
      }
      
      // Fit bounds to all waypoints if we have locations
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, bounds, onMapReady]);
  
  return null;
};

export default MapSetup;
