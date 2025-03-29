
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon } from './Icons';

export interface LocationMarkerProps {
  id: string | number;
  name: string;
  position: [number, number];
  address?: string;
  index?: number; // Make index optional in the props
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ id, name, position, address, index }) => {
  // Only create ref for popup if we're actually showing one
  const popupRef = React.useRef<L.Popup>(null);
  
  // Skip rendering if position contains NaN or zeros
  if (position.some(coord => isNaN(coord) || coord === 0)) {
    console.warn(`Skipping marker for ${name} due to invalid coordinates:`, position);
    return null;
  }
  
  // Handle marker click to open popup
  const handleMarkerClick = () => {
    if (popupRef.current) {
      popupRef.current.openOn(L.DomUtil.get('map') as any);
    }
  };

  // Create a custom icon with the index number if provided
  const getCustomIcon = () => {
    const html = createLocationIcon({ 
      label: index !== undefined ? String(index) : '',
      type: 'Customer'
    });
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: html,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  return (
    <Marker 
      position={position}
      icon={getCustomIcon()}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup ref={popupRef}>
        <div className="text-sm">
          <strong>{name}</strong>
          {address && <div className="mt-1 text-gray-500">{address}</div>}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
