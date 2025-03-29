
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { locationIcon } from './Icons';

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
  const customIcon = locationIcon;
  
  const eventHandlers = onClick ? {
    click: onClick
  } : {};

  return (
    <Marker 
      position={position}
      eventHandlers={eventHandlers}
      // @ts-ignore - icon property is supported in Leaflet but not in the TS definitions
      icon={customIcon}
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
