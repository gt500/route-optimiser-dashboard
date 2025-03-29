
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon } from './Icons';

interface LocationMarkerProps {
  location: {
    id: string | number;
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address?: string;
    sequence?: number;
    emptyCylinders?: number;
    fullCylinders?: number;
    type?: string;
  };
  onLocationClick?: (locationId: string) => void;
  isSelected?: boolean;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  location, 
  onLocationClick,
  isSelected = false
}) => {
  // Use either latitude/longitude or lat/long
  const lat = location.latitude || location.lat || 0;
  const lng = location.longitude || location.long || 0;
  const position: [number, number] = [lat, lng];
  
  // Create a custom icon with sequence number if provided
  let customerIcon;
  
  if (location.sequence !== undefined) {
    customerIcon = createLocationIcon({
      text: `${location.sequence + 1}`,
      backgroundColor: isSelected ? '#818cf8' : '#6366F1',
      textColor: 'white',
      borderColor: isSelected ? '#4f46e5' : '#4f46e5',
    });
  } else if (location.type === 'Storage') {
    customerIcon = createLocationIcon({
      text: 'S',
      backgroundColor: '#10B981',
      textColor: 'white',
      borderColor: '#059669',
    });
  } else {
    customerIcon = createLocationIcon({
      text: 'C',
      backgroundColor: '#F59E0B',
      textColor: 'white',
      borderColor: '#D97706',
    });
  }
  
  // Get additional display information
  const getLocationDetails = () => {
    const details = [];
    
    if (location.emptyCylinders) {
      details.push(`${location.emptyCylinders} empty cylinders`);
    }
    
    if (location.fullCylinders) {
      details.push(`${location.fullCylinders} full cylinders`);
    }
    
    return details.join(', ');
  };
  
  // Event handlers with proper type
  const eventHandlers = onLocationClick ? {
    click: () => {
      onLocationClick(location.id.toString());
    }
  } : {};
  
  return (
    <Marker 
      position={position} 
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-medium text-sm">{location.name}</h3>
          <p className="text-xs text-gray-600">{location.address}</p>
          {getLocationDetails() && (
            <p className="text-xs mt-1 text-indigo-600">{getLocationDetails()}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
