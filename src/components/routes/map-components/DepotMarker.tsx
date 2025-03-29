
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createDepotIcon, createIcon } from './Icons';

interface DepotMarkerProps {
  position: [number, number];
  name: string;
  address?: string;
  isStart?: boolean;
  isEnd?: boolean;
  index?: number;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ 
  position,
  name,
  address,
  isStart = false,
  isEnd = false,
  index
}) => {
  if (!position || position.some(isNaN)) {
    console.error("Invalid position for DepotMarker:", position);
    return null;
  }
  
  const label = index !== undefined ? `${index}` : (isStart ? 'S' : isEnd ? 'E' : 'D');
  
  const iconHtml = createDepotIcon({
    label,
    isStart,
    isEnd,
    customSize: 34
  });
  
  const depotIcon = createIcon(iconHtml, [34, 34]);

  return (
    <Marker 
      position={position}
      icon={depotIcon as L.Icon}
    >
      <Popup>
        <div>
          <div className="font-semibold">{name}</div>
          {address && <div className="text-sm text-gray-600">{address}</div>}
          <div className="text-sm mt-1">
            {isStart ? 'Starting Point' : isEnd ? 'End Point' : 'Depot Location'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default DepotMarker;
