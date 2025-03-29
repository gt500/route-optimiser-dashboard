
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
      const bounds = L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
};
