
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createLocationIcon, createIcon } from './Icons';

interface LocationMarkerProps {
  position: [number, number];
  name: string;
  address?: string;
  cylinders?: number;
  index?: number;
  onLocationClick?: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  position,
  name,
  address,
  cylinders,
  index,
  onLocationClick
}) => {
  if (!position || position.some(isNaN)) {
    console.error("Invalid position for LocationMarker:", position);
    return null;
  }

  const handleClick = () => {
    if (onLocationClick) {
      onLocationClick();
    }
  };
  
  const getIconOptions = () => {
    let options: { label?: string | number; color?: string; customSize?: number } = {
      customSize: 28
    };
    
    if (index !== undefined) {
      options.label = index;
      
      // Different colors based on index ranges
      if (index < 5) {
        options.color = '#6366F1'; // indigo
      } else if (index < 10) {
        options.color = '#8b5cf6'; // violet
      } else if (index < 15) {
        options.color = '#ec4899'; // pink
      } else {
        options.color = '#f97316'; // orange
      }
    } else {
      options.label = 'L';
      options.color = '#6366F1';
    }
    
    return options;
  };
  
  const iconHtml = createLocationIcon(getIconOptions());
  
  const locationIcon = createIcon(iconHtml);

  return (
    <Marker 
      position={position}
      eventHandlers={onLocationClick ? { click: handleClick } : {}}
      icon={locationIcon}
    >
      <Popup>
        <div>
          <div className="font-semibold">{name}</div>
          {address && <div className="text-sm text-gray-600">{address}</div>}
          {cylinders !== undefined && (
            <div className="text-sm mt-1">
              <span className="font-medium">Cylinders: </span> 
              {cylinders}
            </div>
          )}
          {index !== undefined && (
            <div className="text-sm">
              <span className="font-medium">Stop: </span> 
              #{index}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
