
import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon } from './Icons';

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
  // Create a custom icon based on the index using useMemo to avoid unnecessary re-renders
  const iconHtml = useMemo(() => {
    return index !== undefined 
      ? createLocationIcon({ label: index })
      : createLocationIcon({});
  }, [index]);
  
  // Create a Leaflet icon using useMemo
  const markerIcon = useMemo(() => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: iconHtml,
      iconSize: [28, 28] as L.PointExpression,
      iconAnchor: [14, 14] as L.PointExpression
    });
  }, [iconHtml]);
  
  const eventHandlers = onClick ? {
    click: onClick
  } : {};

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
