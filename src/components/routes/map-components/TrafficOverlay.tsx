
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { TrafficSegment, getTrafficColor } from '@/utils/route/trafficUtils';

interface TrafficOverlayProps {
  trafficSegments: TrafficSegment[];
  visible?: boolean;
}

const TrafficOverlay: React.FC<TrafficOverlayProps> = ({ trafficSegments = [], visible = true }) => {
  const map = useMap();
  const layerRef = React.useRef<L.LayerGroup | null>(null);
  
  useEffect(() => {
    // Create layer group if it doesn't exist
    if (!layerRef.current) {
      layerRef.current = L.layerGroup([]).addTo(map);
    }
    
    // Clear existing traffic visualization
    layerRef.current.clearLayers();
    
    // Only add traffic visualization if visible
    if (!visible || trafficSegments.length === 0) return;
    
    // Add new traffic visualization
    trafficSegments.forEach(segment => {
      const polyline = L.polyline(
        [segment.start, segment.end], 
        {
          color: getTrafficColor(segment.level),
          weight: 8,
          opacity: 0.7,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: segment.level === 'heavy' ? '10, 10' : null,
        }
      );
      
      // Add tooltip showing traffic information
      let tooltipContent = `Traffic: ${segment.level.charAt(0).toUpperCase() + segment.level.slice(1)}`;
      if (segment.distance) tooltipContent += `<br>Distance: ${(segment.distance / 1000).toFixed(1)} km`;
      if (segment.duration) tooltipContent += `<br>Time: ${Math.ceil(segment.duration / 60)} min`;
      
      polyline.bindTooltip(tooltipContent);
      
      layerRef.current?.addLayer(polyline);
    });
    
    return () => {
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
    };
  }, [map, trafficSegments, visible]);
  
  return null;
};

export default TrafficOverlay;
