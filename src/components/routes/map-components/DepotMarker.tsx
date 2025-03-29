
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { WarehouseIcon } from './Icons';

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
  const position: [number, number] = [
    depot.latitude || depot.lat || defaultCenter[0], 
    depot.longitude || depot.long || defaultCenter[1]
  ];
  
  return (
    <Marker 
      position={position} 
      icon={WarehouseIcon}
      // @ts-ignore - icon prop is valid but TypeScript definitions are incomplete
    >
      <Popup>
        <div>
          <h3 className="font-medium">{depot.name}</h3>
          <p className="text-xs text-muted-foreground">Depot/Warehouse</p>
        </div>
      </Popup>
    </Marker>
  );
};
