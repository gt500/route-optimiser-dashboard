
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SetViewOnChangeProps {
  coordinates: Array<[number, number]>;
}

export const SetViewOnChange: React.FC<SetViewOnChangeProps> = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error("Error fitting map bounds:", error);
      }
    }
  }, [coordinates, map]);
  
  return null;
};
