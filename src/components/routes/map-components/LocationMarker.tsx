
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
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
  };
  onLocationClick?: (locationId: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ location, onLocationClick }) => {
  const position: [number, number] = [
    location.latitude || location.lat || 0, 
    location.longitude || location.long || 0
  ];
  
  return (
    <Marker 
      position={position} 
      icon={CustomerIcon}
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
        </div>
      </Popup>
    </Marker>
  );
};
