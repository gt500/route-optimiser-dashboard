
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createLocationIcon } from './Icons';
import L from 'leaflet';

export interface LocationMarkerProps {
  id: string | number;
  name: string;
  position: [number, number];
  address?: string;
  index?: number;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ id, name, position, address, index }) => {
  const popupRef = React.useRef<L.Popup>(null);
  
  if (position.some(coord => isNaN(coord) || coord === 0)) {
    console.warn(`Skipping marker for ${name} due to invalid coordinates:`, position);
    return null;
  }
  
  const handleMarkerClick = () => {
    if (popupRef.current) {
      popupRef.current.openOn(document.getElementById('map') as any);
    }
  };

  // Create a custom icon with proper typing
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
