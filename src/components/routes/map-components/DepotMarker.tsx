
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { homeIcon } from './Icons';

interface DepotMarkerProps {
  depot: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    name: string;
  };
  defaultCenter: [number, number];
}

export const DepotMarker: React.FC<DepotMarkerProps> = ({ depot, defaultCenter }) => {
  return (
    <Marker 
      position={[depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]]}
      icon={homeIcon}
    >
      <Popup>
        <div>
          <h3 className="font-bold">{depot.name}</h3>
          <p>Depot / Starting Point</p>
        </div>
      </Popup>
    </Marker>
  );
};
