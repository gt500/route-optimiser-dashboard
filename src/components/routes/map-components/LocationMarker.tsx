
import React, { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { markerIcons } from './Icons';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface LocationMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  address?: string;
  index?: number;
  stopNumber?: number; // The stop number in the route order
  cylinders?: number; // Add cylinders prop
}

// Create a custom marker with stop number in blue color - memoized for performance
const createNumberedMarker = ((number: number) => {
  const icon = L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div class="flex items-center justify-center bg-blue-600 text-white font-bold rounded-full border-2 border-white h-6 w-6 shadow-md">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
  return icon;
});

// Create a blue marker without number - memoized for performance
const createBlueMarker = (() => {
  const icon = L.divIcon({
    className: 'custom-blue-marker',
    html: `<div class="flex items-center justify-center bg-blue-600 text-white font-bold rounded-full border-2 border-white h-6 w-6 shadow-md"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
  return icon;
})();

// Memoized marker component for performance
const LocationMarker: React.FC<LocationMarkerProps> = memo(({
  id, 
  name, 
  position, 
  address,
  index = 0,
  stopNumber,
  cylinders = 0
}) => {
  // Check if position contains valid coordinates
  if (position.some(coord => isNaN(coord) || coord === null || coord === undefined)) {
    console.warn(`Invalid coordinates for location ${name}:`, position);
    return null;
  }
  
  // Use numbered marker for locations page views and route views
  const markerIcon = stopNumber 
    ? createNumberedMarker(stopNumber) 
    : createBlueMarker;

  // Cast to any to avoid TypeScript errors
  const markerProps: any = {
    position,
    icon: markerIcon
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Marker {...markerProps}>
          {/* Standard popup when clicked */}
          <Popup>
            <div className="p-1">
              <h3 className="font-medium text-sm">{name}</h3>
              {stopNumber && <p className="text-xs text-gray-600">Location #{stopNumber}</p>}
              {address && <p className="text-xs text-gray-600">{address}</p>}
              {cylinders > 0 && <p className="text-xs font-medium text-blue-600">Delivery: {cylinders} cylinders</p>}
            </div>
          </Popup>
        </Marker>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-2">
        <div>
          <h3 className="font-bold text-sm">{name}</h3>
          {address && <p className="text-xs text-gray-600 mb-1">{address}</p>}
          {cylinders > 0 && (
            <div className="flex items-center mt-1 bg-blue-50 p-1 rounded">
              <span className="text-xs font-medium text-blue-600">Delivery: {cylinders} cylinders</span>
            </div>
          )}
          {stopNumber && <p className="text-xs text-gray-500 mt-1">Location #{stopNumber}</p>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});

// Add display name for better debugging
LocationMarker.displayName = 'LocationMarker';

export default LocationMarker;
export { LocationMarker };
