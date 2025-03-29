
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SetViewOnChangeProps {
  center?: [number, number];
  coordinates?: Array<[number, number]>;
  zoom?: number;
}

export const SetViewOnChange: React.FC<SetViewOnChangeProps> = ({ coordinates = [], center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error("Error fitting map bounds:", error);
      }
    } else if (center) {
      // If no coordinates but center is provided, use center
      map.setView(center, zoom || map.getZoom());
    }
  }, [coordinates, center, map, zoom]);
  
  return null;
};
