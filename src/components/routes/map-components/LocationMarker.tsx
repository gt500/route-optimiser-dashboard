
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createLocationIcon } from './Icons';
import L from 'leaflet';

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
      popupRef.current.openOn(document.getElementById('map') as any);
    }
  };

  // Create a custom icon - directly using the function that returns L.DivIcon
  const customIcon = createLocationIcon({ 
    label: index !== undefined ? String(index) : '',
    type: 'Customer'
  });

  return (
    <Marker 
      position={position}
      icon={customIcon}
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
