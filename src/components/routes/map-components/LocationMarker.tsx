
import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createIcon, createLocationIcon } from './Icons';

interface LocationMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  address?: string;
  onClick?: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  id, 
  name, 
  position, 
  address, 
  onClick 
}) => {
  // Create an HTML icon for the location marker
  const iconHtml = useMemo(() => {
    return createIcon(
      createLocationIcon({
        type: 'location',
      }), 
      [28, 28]
    );
  }, []);
  
  // Create a Leaflet icon
  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: iconHtml as string,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }, [iconHtml]);
  
  const eventHandlers = useMemo(() => ({
    click: () => {
      if (onClick) onClick();
    }
  }), [onClick]);

  return (
    <Marker 
      position={position} 
      eventHandlers={eventHandlers}
      icon={markerIcon}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{name}</div>
          {address && <div className="text-xs text-muted-foreground">{address}</div>}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
