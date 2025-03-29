
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
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
    type?: string;
    sequence?: number;
    emptyCylinders?: number;
    fullCylinders?: number;
  };
  isSelected?: boolean;
  onLocationClick?: (locationId: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  location,
  isSelected = false,
  onLocationClick
}) => {
  // Use either latitude/longitude or lat/long
  const lat = location.latitude || location.lat || 0;
  const lng = location.longitude || location.long || 0;
  const position: [number, number] = [lat, lng];
  
  // Create a custom icon with sequence number if provided
  let markerIcon;
  
  if (location.sequence !== undefined) {
    markerIcon = createLocationIcon({
      text: `${location.sequence + 1}`,
      backgroundColor: isSelected ? '#818cf8' : '#6366F1',
      textColor: 'white',
      borderColor: isSelected ? '#4f46e5' : '#4f46e5',
    });
  } else if (location.type === 'Storage') {
    markerIcon = createLocationIcon({
      text: 'S',
      backgroundColor: '#10B981',
      textColor: 'white',
      borderColor: '#059669',
    });
  } else {
    markerIcon = createLocationIcon({
      text: 'C',
      backgroundColor: '#F59E0B',
      textColor: 'white',
      borderColor: '#D97706',
    });
  }
  
  // Format location details to display in the popup
  const getLocationDetails = () => {
    const details: string[] = [];
    
    if (location.emptyCylinders) {
      details.push(`${location.emptyCylinders} empty cylinders`);
    }
    
    if (location.fullCylinders) {
      details.push(`${location.fullCylinders} full cylinders`);
    }
    
    if (details.length === 0) {
      return '';
    }
    
    return details.join(', ');
  };
  
  // Handle click event
  const handleClick = () => {
    if (onLocationClick) {
      onLocationClick(location.id.toString());
    }
  };
  
  return (
    <Marker 
      position={position}
      icon={markerIcon as any}
      eventHandlers={onLocationClick ? { click: handleClick } : {}}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-medium">{location.name}</h3>
          {location.address && (
            <p className="text-sm text-gray-600">{location.address}</p>
          )}
          {getLocationDetails() && (
            <p className="text-sm mt-1">{getLocationDetails()}</p>
          )}
          {location.sequence !== undefined && (
            <div className="text-xs mt-1 text-indigo-600">Stop #{location.sequence + 1}</div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
