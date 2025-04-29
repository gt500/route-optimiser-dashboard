
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapSetupProps {
  bounds: [[number, number], [number, number]] | null;
  center?: [number, number];
  zoom?: number;
  onMapReady?: () => void;
}

const MapSetup: React.FC<MapSetupProps> = ({ bounds, center, zoom, onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    // If we have bounds, set the map view to those bounds
    if (bounds) {
      map.fitBounds(bounds);
    } 
    // If no bounds but we have a center and zoom, use those
    else if (center && zoom) {
      map.setView(center, zoom);
    }
    
    // Notify that map is ready
    if (onMapReady) {
      setTimeout(() => {
        onMapReady();
      }, 100);
    }
    
    // Force a map invalidate size to handle any container resize issues
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
    
  }, [map, bounds, center, zoom, onMapReady]);
  
  return null;
};

export default MapSetup;
