
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface DepotMarkerProps {
  depot: {
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
  };
  defaultCenter: [number, number];
}

export const DepotMarker: React.FC<DepotMarkerProps> = ({ depot, defaultCenter }) => {
  // Only render if depot has valid coordinates
  if (!(depot.latitude || depot.lat) || !(depot.longitude || depot.long)) {
    return null;
  }
  
  const position: [number, number] = [
    depot.latitude || depot.lat || defaultCenter[0], 
    depot.longitude || depot.long || defaultCenter[1]
  ];
  
  // Create a depot icon
  const depotIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });
  
  return (
    <Marker 
      position={position}
      // Correctly define the icon as a React-Leaflet expects it
      icon={depotIcon}
    >
      <Popup>
        <div>
          <h3 className="font-medium">{depot.name}</h3>
          <p className="text-xs font-medium text-emerald-600">Depot/Warehouse</p>
        </div>
      </Popup>
    </Marker>
  );
};
