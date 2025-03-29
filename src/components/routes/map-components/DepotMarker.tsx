
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon } from './Icons';

interface DepotMarkerProps {
  depot: {
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address?: string;
    fullCylinders?: number;
  };
}

export const DepotMarker: React.FC<DepotMarkerProps> = ({ depot }) => {
  // Use either latitude/longitude or lat/long
  const lat = depot.latitude || depot.lat || 0;
  const lng = depot.longitude || depot.long || 0;
  
  // Skip invalid locations
  if (lat === 0 && lng === 0) {
    console.warn("Invalid depot coordinates for:", depot.name);
    return null;
  }
  
  const position: [number, number] = [lat, lng];
  
  // Create a custom icon for depots
  const iconHtml = createLocationIcon({
    text: 'D',
    backgroundColor: '#10B981',
    textColor: 'white',
    borderColor: '#059669',
    size: 30
  });
  
  const depotIcon = L.divIcon({
    className: 'custom-depot-marker',
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  
  return (
    <Marker 
      position={position}
      icon={depotIcon as any}
    >
      <Popup>
        <div>
          <h3 className="font-medium">{depot.name}</h3>
          {depot.address && <p className="text-sm text-gray-600">{depot.address}</p>}
          {depot.fullCylinders && <p className="text-sm mt-1">{depot.fullCylinders} full cylinders available</p>}
        </div>
      </Popup>
    </Marker>
  );
};
