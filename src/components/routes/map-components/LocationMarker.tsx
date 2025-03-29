
import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createIcon, createLocationIcon } from './Icons';

interface LocationMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  index?: number;
  onClick?: () => void;
  type?: 'customer' | 'storage';
  address?: string;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  id, 
  name, 
  position, 
  index, 
  onClick,
  type = 'customer',
  address
}) => {
  const eventHandlers = useMemo(
    () => ({
      click: () => {
        if (onClick) {
          onClick();
        }
      },
    }),
    [onClick]
  );

  const iconType = type === 'storage' ? 'storage' : 'customer';
  const iconHtml = createIcon(createLocationIcon({ 
    type: iconType, 
    label: index !== undefined ? String(index) : ''
  }), [24, 24]);
  
  // Create a Leaflet icon using useMemo to avoid unnecessary re-renders
  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: iconHtml as string,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }, [iconHtml, index]);
  
  return (
    <Marker 
      position={position}
      eventHandlers={eventHandlers}
      icon={markerIcon as any}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{name}</div>
          {index !== undefined && (
            <div className="text-xs bg-primary/10 px-2 py-1 rounded-sm text-primary mt-1 inline-block">
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
