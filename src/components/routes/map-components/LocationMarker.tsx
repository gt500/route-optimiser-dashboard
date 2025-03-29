
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createIcon, createLocationIcon } from './Icons';

interface LocationMarkerProps {
  id: string | number;
  name: string;
  position: [number, number];
  address?: string;
  type?: string;
  cylinders?: number | string;
  fullCylinders?: number;
  emptyCylinders?: number;
  index?: number;
  onClick?: (id: string | number) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  id,
  name,
  position,
  address,
  type,
  cylinders,
  fullCylinders,
  emptyCylinders,
  index,
  onClick
}) => {
  if (!position || position.some(isNaN)) {
    console.error("Invalid position for LocationMarker:", position);
    return null;
  }

  // Handle click event if provided
  const handleClick = () => {
    if (onClick) onClick(id);
  };

  // Create marker icon based on location type and index
  let iconHtml;
  if (index !== undefined) {
    iconHtml = createLocationIcon({
      label: `${index}`,
      type: type || 'Customer'
    });
  } else {
    iconHtml = createLocationIcon({
      type: type || 'Customer'
    });
  }

  const locationIcon = createIcon(iconHtml, [30, 30]);

  return (
    <Marker
      position={position}
      eventHandlers={onClick ? { click: handleClick } : {}}
      icon={locationIcon as L.Icon}
    >
      <Popup>
        <div>
          <div className="font-semibold">{name}</div>
          {address && <div className="text-sm text-gray-600">{address}</div>}
          {type && <div className="text-sm text-gray-600">Type: {type}</div>}
          {cylinders !== undefined && (
            <div className="text-sm text-gray-600">Cylinders: {cylinders}</div>
          )}
          {fullCylinders !== undefined && (
            <div className="text-sm text-green-600">Full cylinders: {fullCylinders}</div>
          )}
          {emptyCylinders !== undefined && (
            <div className="text-sm text-red-600">Empty cylinders: {emptyCylinders}</div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
