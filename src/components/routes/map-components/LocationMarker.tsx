
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CustomerIcon } from './Icons';

interface LocationMarkerProps {
  location: {
    id: string | number;
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address: string;
    sequence?: number; // Added sequence for route order display
  };
  onLocationClick?: (locationId: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ location, onLocationClick }) => {
  const position: [number, number] = [
    location.latitude || location.lat || 0, 
    location.longitude || location.long || 0
  ];
  
  // Create a new instance of the icon to avoid TypeScript issues
  const customerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
  
  return (
    <Marker 
      position={position} 
      icon={customerIcon}
      eventHandlers={{
        click: () => {
          if (onLocationClick) {
            onLocationClick(location.id.toString());
          }
        }
      }}
    >
      <Popup>
        <div>
          <h3 className="font-medium">{location.name}</h3>
          <p className="text-xs text-muted-foreground">{location.address}</p>
          {location.sequence !== undefined && (
            <p className="text-xs font-medium text-blue-600 mt-1">
              Stop #{location.sequence + 1}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
