
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { markerIcons } from './Icons';

interface LocationMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  address?: string;
  index?: number;
  stopNumber?: number; // The stop number in the route order
}

// Create a custom marker with stop number
const createNumberedMarker = (number: number) => {
  const icon = L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div class="flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full border-2 border-white h-6 w-6 shadow-md">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
  return icon;
};

const LocationMarker: React.FC<LocationMarkerProps> = ({
  id, 
  name, 
  position, 
  address,
  index = 0,
  stopNumber
}) => {
  // Check if position contains valid coordinates
  if (position.some(coord => isNaN(coord) || coord === null || coord === undefined)) {
    console.warn(`Invalid coordinates for location ${name}:`, position);
    return null;
  }
  
  // Use numbered marker if stopNumber is provided
  const markerIcon = stopNumber 
    ? createNumberedMarker(stopNumber) 
    : markerIcons.default;

  // Cast to any to avoid TypeScript errors
  const markerProps: any = {
    position,
    icon: markerIcon
  };

  return (
    <Marker {...markerProps}>
      <Popup>
        <div className="p-1">
          <h3 className="font-medium text-sm">{name}</h3>
          {stopNumber && <p className="text-xs text-gray-600">Stop #{stopNumber}</p>}
          {address && <p className="text-xs text-gray-600">{address}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
export { LocationMarker };
