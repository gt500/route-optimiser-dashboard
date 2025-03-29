
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon } from './Icons';

interface LocationProps {
  id: string | number;
  name: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  long?: number;
  address?: string;
  sequence?: number;
}

interface LocationMarkerProps {
  location: LocationProps;
  onLocationClick?: (locationId: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ location, onLocationClick }) => {
  // Use either latitude/longitude or lat/long
  const lat = location.latitude || location.lat || 0;
  const lng = location.longitude || location.long || 0;
  
  // Skip invalid locations
  if (lat === 0 && lng === 0) {
    console.warn("Invalid location coordinates for:", location.name);
    return null;
  }
  
  const position: [number, number] = [lat, lng];
  
  // Create a custom icon for different locations
  // Base the icon color on the sequence number to visually differentiate stops
  const getIconOptions = () => {
    const hasSequence = location.sequence !== undefined;
    
    // Default icon options
    const options = {
      text: hasSequence ? `${location.sequence + 1}` : 'L',
      backgroundColor: '#6366F1', // Default indigo color
      textColor: 'white',
      borderColor: '#4F46E5',
      size: 28
    };
    
    // Customize based on sequence
    if (hasSequence) {
      const sequence = location.sequence;
      
      // First location in sequence (origin)
      if (sequence === 0) {
        options.backgroundColor = '#10B981'; // Green
        options.borderColor = '#059669';
        options.size = 30;
      }
      // Last location if there are at least 2 locations
      else if (sequence >= 2 && location.name.toLowerCase().includes('depot')) {
        options.backgroundColor = '#F59E0B'; // Amber
        options.borderColor = '#D97706';
        options.size = 30;
      }
    }
    
    return options;
  };
  
  const iconHtml = createLocationIcon(getIconOptions());
  
  const locationIcon = L.divIcon({
    className: 'custom-location-marker',
    html: iconHtml,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  
  const handleClick = () => {
    if (onLocationClick) {
      onLocationClick(location.id.toString());
    }
  };
  
  return (
    <Marker 
      position={position}
      eventHandlers={onLocationClick ? { click: handleClick } : {}}
      icon={locationIcon as any}
    >
      <Popup>
        <div>
          <h3 className="font-medium">{location.name}</h3>
          {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
          {location.sequence !== undefined && (
            <p className="text-xs mt-1 font-semibold">Stop #{location.sequence + 1}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
