
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { locationIcon } from './Icons';

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
  return (
    <Marker 
      position={[location.latitude || location.lat || 0, location.longitude || location.long || 0]}
      icon={locationIcon as any}
      eventHandlers={{
        click: () => {
          if (onLocationClick) onLocationClick(location.id.toString());
        }
      }}
    >
      <Popup>
        <div>
          <h3 className="font-bold">{location.name}</h3>
          <p className="text-sm">{location.address}</p>
        </div>
      </Popup>
    </Marker>
  );
};
