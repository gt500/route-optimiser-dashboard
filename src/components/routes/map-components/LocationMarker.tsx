
import React from 'react';
import { Marker, Popup, MarkerProps } from 'react-leaflet';
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
  // Use numbered marker if stopNumber is provided
  const markerIcon = stopNumber 
    ? createNumberedMarker(stopNumber) 
    : markerIcons.default;

  // Use type assertion to handle the icon prop which is not properly typed in @types/react-leaflet
  return (
    <Marker 
      position={position}
      icon={markerIcon as any}
    >
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
