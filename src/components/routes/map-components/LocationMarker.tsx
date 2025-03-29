
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createIcon, createLocationIcon } from './Icons';

interface LocationMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  address?: string;
  index?: number;
  onClick?: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  id,
  name,
  position,
  address,
  index,
  onClick
}) => {
  // Create a custom icon based on the index
  const iconWithIndex = index !== undefined 
    ? createIcon(createLocationIcon({ label: index }), [28, 28])
    : createIcon(createLocationIcon({}), [28, 28]);
  
  const eventHandlers = onClick ? {
    click: onClick
  } : {};

  return (
    <Marker 
      position={position}
      eventHandlers={eventHandlers}
      icon={iconWithIndex as L.Icon}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{name}</div>
          {index !== undefined && (
            <div className="text-xs bg-primary/10 px-2 py-1 rounded-sm text-primary-foreground/90 mt-1 inline-block">
              Stop #{index}
            </div>
          )}
          {address && (
            <div className="text-xs text-muted-foreground mt-1">
              {address}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
