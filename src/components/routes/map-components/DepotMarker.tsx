
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
  
  // Create a warehouse icon
  const warehouseIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1479/1479733.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  return (
    <Marker 
      position={position}
      // @ts-ignore - the type definition is missing the icon prop but it works in practice
      icon={warehouseIcon}
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
